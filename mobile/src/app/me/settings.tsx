import { Button, Card, Header, ListRow, Screen, Segmented, Spacer, Text, ToggleRow } from '@/components/ui';
import { showAlert } from '@/lib/dialog';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { remindersAvailable } from '@/lib/notifications';
import { useTheme, type ThemePreference } from '@/theme/theme';

export default function Settings() {
  const { preference, setPreference } = useTheme();
  const { me, refreshMe, signOut } = useAuth();
  if (!me) return null;

  const setReminders = async (on: boolean) => {
    try {
      await api.updateProfile(me.id, { reminders_enabled: on });
      await refreshMe();
    } catch {
      showAlert('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
    }
  };

  return (
    <Screen>
      <Header center={<Text variant="title">Ajustes</Text>} />
      <Text variant="label">Apariencia</Text>
      <Segmented<ThemePreference>
        label="Apariencia"
        value={preference}
        onChange={setPreference}
        options={[
          { value: 'dark', label: 'Oscuro', icon: 'dark_mode' },
          { value: 'light', label: 'Claro', icon: 'light_mode' },
          { value: 'system', label: 'Sistema', icon: 'contrast' },
        ]}
      />
      {remindersAvailable ? (
        <>
          <Text variant="label">Notificaciones</Text>
          <Card>
            <ToggleRow icon="alarm" label="Recordatorios" subtitle="1 h antes de cada plan, en este teléfono" value={me.remindersEnabled} onChange={setReminders} />
          </Card>
        </>
      ) : null}
      <Text variant="label">Cuenta</Text>
      <Card>
        <ListRow icon="school" title="Universidad" right={<Text variant="small" tone="muted">{me.campus.shortName}</Text>} />
        <ListRow icon="language" title="Idioma" right={<Text variant="small" tone="muted">Español</Text>} />
      </Card>
      <Spacer />
      <Button
        label="Cerrar sesión"
        icon="logout"
        variant="secondary"
        danger
        onPress={() =>
          showAlert('¿Cerrar sesión?', 'Para volver a entrar te mandamos un código a tu correo.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut() },
          ])
        }
      />
    </Screen>
  );
}
