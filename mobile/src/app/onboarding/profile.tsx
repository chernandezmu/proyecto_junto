import { router } from 'expo-router';

import { ProfileForm } from '@/components/ProfileForm';
import { Header, Row, Screen, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function OnboardingProfile() {
  const { me, refreshMe } = useAuth();
  if (!me) return null;
  return (
    <Screen>
      {me.verification === 'pending_upload' || me.verification === 'rejected' ? (
        <Header center="Paso 3 de 3" />
      ) : (
        <Row justify="center" style={{ minHeight: 48 }}>
          <Text variant="label">Paso 3 de 3</Text>
        </Row>
      )}
      <Text variant="h1">Arma tu perfil</Text>
      <ProfileForm
        me={me}
        submitLabel="Entrar a Junto"
        onDone={async () => {
          await refreshMe();
          router.replace('/home');
        }}
      />
    </Screen>
  );
}
