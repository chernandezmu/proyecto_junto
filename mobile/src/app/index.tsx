import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/auth';

/** Punto de entrada: decide a dónde ir según la sesión y el estado del registro. */
export default function Index() {
  const { session, me } = useAuth();
  if (!session) return <Redirect href="/welcome" />;
  if (!me) return null;
  if (me.verification === 'pending_upload' || me.verification === 'rejected') return <Redirect href="/onboarding/verify" />;
  if (me.fullName.trim() === '' || me.interests.length < 3) return <Redirect href="/onboarding/profile" />;
  return <Redirect href="/home" />;
}
