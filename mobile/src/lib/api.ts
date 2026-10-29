import { z } from 'zod';

import { supabase } from './supabase';
import type { CategoryKey } from '@/theme/tokens';

// ── Esquemas de las respuestas de las RPC (la app no confía en formas sin validar) ──

export const PersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo: z.string().nullable(),
  career: z.string().nullable().optional(),
  semester: z.number().nullable().optional(),
  verified: z.boolean(),
});
export type Person = z.infer<typeof PersonSchema>;

export const PlanCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  startsAt: z.string(),
  place: z.string(),
  capacity: z.number(),
  joined: z.number(),
  cancelHours: z.number(),
  access: z.enum(['open', 'approval']),
  status: z.enum(['published', 'cancelled', 'finished']),
  photo: z.string().nullable(),
  pinned: z.string().nullable(),
  organizer: PersonSchema,
  organizerRating: z.coerce.number().nullable(),
  isOrganizer: z.boolean(),
  myStatus: z.enum(['joined', 'pending', 'rejected', 'cancelled']).nullable(),
  saved: z.boolean(),
});
export type PlanCard = z.infer<typeof PlanCardSchema>;

export const PlanDetailSchema = PlanCardSchema.extend({
  attendees: z.array(PersonSchema),
  pendingCount: z.number().nullable(),
  arrived: z.boolean().nullable(),
  checkedIn: z.boolean().nullable(),
  rated: z.boolean(),
  onWaitlist: z.boolean(),
});
export type PlanDetail = z.infer<typeof PlanDetailSchema>;

export const MeSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  career: z.string().nullable(),
  semester: z.number().nullable(),
  interests: z.array(z.string()),
  photo: z.string().nullable(),
  showCareer: z.boolean(),
  visibility: z.enum(['campus', 'plans']),
  remindersEnabled: z.boolean(),
  verification: z.enum(['pending_upload', 'in_review', 'approved', 'rejected']),
  rejectionReason: z.string().nullable(),
  consented: z.boolean(),
  campus: z.object({ id: z.string(), name: z.string(), shortName: z.string() }),
  stats: z.object({ plans: z.number(), attended: z.number(), rating: z.coerce.number().nullable() }),
});
export type Me = z.infer<typeof MeSchema>;

export const MessageSchema = z.object({
  id: z.number(),
  kind: z.enum(['user', 'system']),
  body: z.string(),
  createdAt: z.string(),
  mine: z.boolean().nullable(),
  author: PersonSchema.nullable(),
});
export type Message = z.infer<typeof MessageSchema>;

export const RequestSchema = PersonSchema.extend({ status: z.enum(['pending', 'joined', 'rejected']), checkedIn: z.boolean() });
export type Request = z.infer<typeof RequestSchema>;

export const HomeSchema = z.object({ next: PlanCardSchema.nullable(), todayCount: z.number(), today: z.array(PlanCardSchema) });
export type Home = z.infer<typeof HomeSchema>;

// ── Llamadas ──

async function rpc<T>(fn: string, args: Record<string, unknown>, schema: z.ZodType<T>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw error;
  return schema.parse(data);
}
async function rpcVoid(fn: string, args: Record<string, unknown> = {}) {
  const { error } = await supabase.rpc(fn, args);
  if (error) throw error;
}

export const api = {
  me: () => rpc('get_me', {}, MeSchema),
  recordConsent: () => rpcVoid('record_consent'),
  submitVerification: (birthDate: string, studentCode: string, filePath: string) =>
    rpcVoid('submit_verification', { p_birth_date: birthDate, p_student_code: studentCode, p_file_path: filePath }),
  updateProfile: async (id: string, patch: Partial<{ full_name: string; career: string | null; semester: number | null; interests: string[]; photo_path: string | null; show_career: boolean; visibility: 'campus' | 'plans'; reminders_enabled: boolean }>) => {
    const { error } = await supabase.from('profiles').update(patch).eq('id', id);
    if (error) throw error;
  },
  exportData: () => rpc('export_my_data', {}, z.unknown()),
  deleteAccount: () => rpcVoid('delete_my_account'),

  home: () => rpc('get_home', {}, HomeSchema),
  feed: (category?: CategoryKey | null) => rpc('get_feed', { p_category: category ?? null }, z.array(PlanCardSchema)),
  plan: (id: string) => rpc('get_plan', { p_plan_id: id }, PlanDetailSchema),
  myPlans: (tab: 'upcoming' | 'organizing' | 'past') => rpc('get_my_plans', { p_tab: tab }, z.array(PlanCardSchema)),

  createPlan: (p: { title: string; category: CategoryKey; startsAt: Date; place: string; capacity: number; cancelHours: 1 | 3 | 24; access: 'open' | 'approval'; description?: string; photoPath?: string | null }) =>
    rpc(
      'create_plan',
      {
        p_title: p.title,
        p_category: p.category,
        p_starts_at: p.startsAt.toISOString(),
        p_place: p.place,
        p_capacity: p.capacity,
        p_cancel_hours: p.cancelHours,
        p_access: p.access,
        p_description: p.description ?? null,
        p_photo_path: p.photoPath ?? null,
      },
      z.string(),
    ),
  setPinned: (planId: string, text: string) => rpcVoid('set_pinned_message', { p_plan_id: planId, p_text: text }),
  cancelPlan: (planId: string) => rpcVoid('cancel_plan', { p_plan_id: planId }),
  finishPlan: (planId: string) => rpcVoid('finish_plan', { p_plan_id: planId }),
  requests: (planId: string) => rpc('get_requests', { p_plan_id: planId }, z.array(RequestSchema)),
  respond: (planId: string, userId: string, accept: boolean) => rpcVoid('respond_request', { p_plan_id: planId, p_user_id: userId, p_accept: accept }),
  checkIn: (planId: string, code: string) => rpc('check_in', { p_plan_id: planId, p_code: code }, PersonSchema),

  join: (planId: string) => rpc('join_plan', { p_plan_id: planId }, z.object({ status: z.enum(['joined', 'pending', 'full']) })),
  cancelAttendance: (planId: string, reason?: string | null) => rpcVoid('cancel_attendance', { p_plan_id: planId, p_reason: reason ?? null }),
  myCode: (planId: string) => rpc('get_my_code', { p_plan_id: planId }, z.string().nullable()),
  arrived: (planId: string, late = false) => rpcVoid('mark_arrived', { p_plan_id: planId, p_late: late }),
  rate: (planId: string, stars: number, liked: string[]) => rpcVoid('rate_plan', { p_plan_id: planId, p_stars: stars, p_liked: liked }),

  messages: (planId: string) => rpc('get_messages', { p_plan_id: planId }, z.array(MessageSchema)),
  send: (planId: string, body: string) => rpc('send_message', { p_plan_id: planId, p_body: body }, z.number()),

  report: (targetType: 'plan' | 'user' | 'message', targetId: string, reason: ReportReason, details?: string) =>
    rpcVoid('report', { p_target_type: targetType, p_target_id: targetId, p_reason: reason, p_details: details ?? null }),
  block: (userId: string) => rpcVoid('block_user', { p_user_id: userId }),
  unblock: (userId: string) => rpcVoid('unblock_user', { p_user_id: userId }),
  blocked: () => rpc('get_blocked', {}, z.array(PersonSchema)),
  toggleSaved: (planId: string) => rpc('toggle_saved', { p_plan_id: planId }, z.boolean()),
  setWaitlist: (planId: string, on: boolean) => rpcVoid('set_plan_waitlist', { p_plan_id: planId, p_on: on }),
  setModuleInterest: (module: 'wheels' | 'tours' | 'feed', on: boolean) => rpcVoid('set_module_interest', { p_module: module, p_on: on }),
};

export type ReportReason = 'acoso' | 'falso' | 'peligro' | 'spam' | 'no_estudiante' | 'otro';
