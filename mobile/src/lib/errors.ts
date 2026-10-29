// Traduce los códigos que devuelven las RPC a mensajes con causa y solución (DESIGN.md · formularios).

const MESSAGES: Record<string, string> = {
  DOMAIN_NOT_ALLOWED: 'Por ahora Junto es solo para la Universidad El Bosque. Usa tu correo @unbosque.edu.co.',
  UNAUTHENTICATED: 'Tu sesión se cerró. Vuelve a entrar con tu correo.',
  NOT_VERIFIED: 'Podrás hacer esto cuando aprobemos tu carné. Tarda menos de 24 h.',
  UNDERAGE: 'Junto es para mayores de 18 años.',
  BAD_FILE: 'No pudimos usar ese archivo. Súbelo de nuevo.',
  BAD_STUDENT_CODE: 'Revisa tu código estudiantil: debe tener entre 3 y 30 caracteres.',
  ALREADY_VERIFIED: 'Tu carné ya está aprobado.',
  NOT_FOUND: 'Este plan ya no está disponible o no tienes acceso a él.',
  OWN_PLAN: 'Este plan es tuyo: ya estás dentro.',
  CLOSED: 'Este plan ya no recibe inscripciones.',
  FULL: 'Este plan se llenó.',
  CANCEL_CLOSED: 'Ya pasó el límite para cancelar. Avísale al organizador en el chat.',
  BAD_DATE: 'Elige una fecha y hora desde 15 minutos a partir de ahora y hasta 60 días.',
  TOO_MANY_ACTIVE_PLANS: 'Puedes tener hasta 3 planes activos a la vez. Termina o cancela uno para crear otro.',
  RATE_LIMITED: 'Muchos intentos seguidos. Espera un momento y vuelve a intentarlo.',
  BAD_CODE: 'Ese código no es de este plan. Pídele a la persona que lo revise.',
  NOT_IN_WINDOW: 'Los códigos se validan desde 1 h antes del plan.',
  NOT_FINISHED: 'Podrás calificar cuando el plan empiece.',
  SELF: 'No puedes hacer eso contigo.',
};

export function errorCode(e: unknown): string | null {
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e ?? '');
  const hit = Object.keys(MESSAGES).find((k) => msg.includes(k));
  if (hit) return hit;
  if (/Database error saving new user/i.test(msg)) return 'DOMAIN_NOT_ALLOWED';
  return null;
}

export function friendlyError(e: unknown, fallback = 'No se pudo completar. Revisa tu conexión e inténtalo de nuevo.'): string {
  const code = errorCode(e);
  if (code) return MESSAGES[code];
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  if (/network|fetch/i.test(msg)) return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
  if (/expired|invalid.*otp|token has expired/i.test(msg)) return 'Ese código no coincide o ya venció. Revisa el último correo que te enviamos.';
  if (/rate limit|too many/i.test(msg)) return MESSAGES.RATE_LIMITED;
  return fallback;
}
