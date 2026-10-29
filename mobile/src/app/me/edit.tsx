import { router } from 'expo-router';

import { ProfileForm } from '@/components/ProfileForm';
import { Header, Screen, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function EditProfile() {
  const { me, refreshMe } = useAuth();
  if (!me) return null;
  return (
    <Screen>
      <Header center={<Text variant="title">Editar perfil</Text>} />
      <ProfileForm
        me={me}
        submitLabel="Guardar cambios"
        onDone={async () => {
          await refreshMe();
          router.back();
        }}
      />
    </Screen>
  );
}
