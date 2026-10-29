import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Card, Chip, Header, IconButton, ListRow, Row, Screen, Tag, Text } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { mediaUrl } from '@/lib/supabase';

export default function Profile() {
  const { me, refreshMe } = useAuth();
  if (!me) return null;
  const sub = [me.career, me.semester ? `${me.semester}° semestre` : null].filter(Boolean).join(' · ');
  const approved = me.verification === 'approved';

  return (
    <Screen refreshing={false} onRefresh={refreshMe}>
      <Header right={<IconButton icon="settings" label="Ajustes" onPress={() => router.push('/me/settings')} />} />
      <Row gap={16}>
        <Avatar name={me.fullName || 'Tú'} photoUrl={mediaUrl(me.photo)} dim="xl" raised />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="h2">{me.fullName}</Text>
          {sub ? (
            <Text variant="small" tone="muted">
              {sub}
            </Text>
          ) : null}
          {approved ? <Tag label="Estudiante verificada/o" fill="mint" icon="verified" /> : <Tag label="Carné en revisión" fill="sky" icon="hourglass_top" />}
        </View>
      </Row>
      <Row gap={10}>
        <Stat value={String(me.stats.plans)} label="Planes" />
        <Stat value={String(me.stats.attended)} label="Asistencias" />
        <Stat value={me.stats.rating ? String(me.stats.rating).replace('.', ',') : '—'} label="★" />
      </Row>
      <Text variant="label">Intereses</Text>
      <Row wrap gap={8}>
        {me.interests.map((t) => (
          <Chip key={t} label={t} selected />
        ))}
        <Chip label="Editar" icon="edit" onPress={() => router.push('/me/edit')} />
      </Row>
      <Card>
        <ListRow icon="edit" title="Editar perfil" onPress={() => router.push('/me/edit')} />
        <ListRow icon="settings" title="Ajustes" onPress={() => router.push('/me/settings')} />
        <ListRow icon="shield" title="Privacidad y seguridad" onPress={() => router.push('/me/privacy')} />
      </Card>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card compact style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text variant="stat" tabular>
        {value}
      </Text>
      <Text variant="label">{label}</Text>
    </Card>
  );
}
