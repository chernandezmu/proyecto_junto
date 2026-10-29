import { router } from 'expo-router';
import { Alert, Linking, Share, View } from 'react-native';

import { Button, Card, Header, Icon, ListRow, Screen, Segmented, Text, ToggleRow } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { friendlyError } from '@/lib/errors';
import { removeAllMyFiles } from '@/lib/media';
import { fills } from '@/theme/tokens';

const SECURITY_CONTACT = 'chernandezmu@unbosque.edu.co';

export default function Privacy() {
  const { me, refreshMe, signOut } = useAuth();
  if (!me) return null;
  const approved = me.verification === 'approved';

  const update = async (patch: Parameters<typeof api.updateProfile>[1]) => {
    try {
      await api.updateProfile(me.id, patch);
      await refreshMe();
    } catch {
      Alert.alert('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
    }
  };

  const exportData = async () => {
    try {
      const data = await api.exportData();
      await Share.share({ title: 'Mis datos de Junto', message: JSON.stringify(data, null, 2) });
    } catch (e) {
      Alert.alert('No pudimos exportar tus datos', friendlyError(e));
    }
  };

  const deleteAccount = () =>
    Alert.alert('¿Eliminar tu cuenta?', 'Borramos tu perfil, tus inscripciones, tus mensajes y tus calificaciones. Los planes futuros que organizas se cancelan. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar mi cuenta',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeAllMyFiles(me.id);
            await api.deleteAccount();
            await signOut();
          } catch (e) {
            Alert.alert('No pudimos eliminar tu cuenta', friendlyError(e));
          }
        },
      },
    ]);

  return (
    <Screen>
      <Header center={<Text variant="title">Privacidad y seguridad</Text>} />
      <Card fill={approved ? 'mint' : 'sky'} row>
        <Icon name={approved ? 'verified_user' : 'hourglass_top'} size={32} color={fills.onFill} />
        <View style={{ flex: 1 }}>
          <Text variant="title" tone="onFill">
            {approved ? 'Identidad verificada' : 'Verificación en revisión'}
          </Text>
          <Text variant="small" tone="onFill">
            {approved ? `Correo @unbosque.edu.co y carné validados` : 'Revisamos tu carné en menos de 24 h'}
          </Text>
        </View>
      </Card>

      <Text variant="label">Quién ve mi perfil</Text>
      <Segmented
        label="Quién ve mi perfil"
        value={me.visibility}
        onChange={(v) => update({ visibility: v })}
        options={[
          { value: 'campus', label: 'Mi campus' },
          { value: 'plans', label: 'Solo mis planes' },
        ]}
      />
      <Card>
        <ToggleRow icon="school" label="Mostrar carrera y semestre" value={me.showCareer} onChange={(v) => update({ show_career: v })} />
        <ListRow icon="chat" title="Mensajes solo de tus planes" subtitle="Siempre activo: nadie te escribe si no comparten un plan." />
      </Card>

      <Card>
        <ListRow icon="block" title="Usuarios bloqueados" onPress={() => router.push('/me/blocked')} />
        <ListRow icon="report" title="Reportar un problema" onPress={() => Linking.openURL(`mailto:${SECURITY_CONTACT}?subject=${encodeURIComponent('Problema en Junto')}`)} />
        <ListRow icon="gavel" title="Normas de la comunidad" onPress={() => router.push('/legal/normas')} />
        <ListRow icon="lock" title="Política de datos" onPress={() => router.push('/legal/privacidad')} />
        <ListRow icon="download" title="Descargar mis datos" onPress={exportData} />
        <ListRow icon="mail" title="Contacto de seguridad" subtitle={SECURITY_CONTACT} onPress={() => Linking.openURL(`mailto:${SECURITY_CONTACT}`)} />
      </Card>
      <Button label="Eliminar mi cuenta" icon="delete" variant="secondary" danger onPress={deleteAccount} />
    </Screen>
  );
}
