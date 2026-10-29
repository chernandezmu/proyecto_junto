import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';

import { categoryOf } from '@/components/plan';
import { AvatarStack, Banner, Card, ErrorCard, Icon, IconTile, RootHeader, Row, Screen, Skeleton, Tag, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { when } from '@/lib/format';
import { mediaUrl } from '@/lib/supabase';
import { borderWidth, fills, hardShadow } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export default function Home() {
  const { colors } = useTheme();
  const { me } = useAuth();
  const home = useQuery({ queryKey: ['home'], queryFn: api.home });
  if (!me) return null;
  const approved = me.verification === 'approved';
  const firstName = me.fullName.split(' ')[0] || 'Hola';
  const next = home.data?.next;

  return (
    <Screen tab fabClearance refreshing={home.isRefetching} onRefresh={home.refetch}>
      <RootHeader
        name={me.fullName}
        photoUrl={mediaUrl(me.photo)}
        left={
          <Row gap={10}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={{ width: 40, height: 40, borderRadius: 12, borderWidth, borderColor: colors.border, boxShadow: hardShadow('sm', colors.shadow) }}
              accessible={false}
            />
            <Text variant="label" style={{ flex: 1 }}>
              {me.campus.name} · {approved ? 'verificada' : 'en revisión'}
            </Text>
          </Row>
        }
      />
      <Text variant="h1">Hola, {firstName}</Text>

      {!approved ? (
        <Banner icon="hourglass_top" fill="sky" title="Estamos revisando tu carné" body="Tarda menos de 24 h. Mientras tanto puedes mirar los planes, pero aún no unirte ni crear." />
      ) : null}

      {home.isLoading ? (
        <Skeleton height={140} />
      ) : home.isError ? (
        <ErrorCard onRetry={home.refetch} />
      ) : next ? (
        <Card fill="lime" onPress={() => router.push(next.isOrganizer ? `/plan/${next.id}/manage` : `/plan/${next.id}/chat`)} label={`Tu próximo plan: ${next.title}, ${when(next.startsAt)}`}>
          <Row justify="space-between">
            <Text variant="label" tone="onFill">
              {when(next.startsAt)}
            </Text>
            <Icon name="arrow_outward" color={fills.onFill} />
          </Row>
          <Text variant="h2" tone="onFill">
            {next.title}
          </Text>
          <Row>
            <AvatarStack people={[next.organizer]} total={next.joined + 1} max={1} />
            <Text variant="small" tone="onFill" style={{ flex: 1 }} numberOfLines={1}>
              {next.place}
            </Text>
          </Row>
        </Card>
      ) : (
        <Card row onPress={() => router.push('/events/feed')} label="Aún no tienes planes. Descubrir planes">
          <IconTile icon="explore" fill="lilac" />
          <View style={{ flex: 1 }}>
            <Text variant="title">Aún no tienes planes</Text>
            <Text variant="small" tone="muted">
              Hay {home.data?.todayCount ?? 0} planes en tu campus hoy.
            </Text>
          </View>
          <Icon name="chevron_right" />
        </Card>
      )}

      <Text variant="label" style={{ marginTop: 6 }}>
        ¿Qué quieres hacer?
      </Text>
      <ModuleRow icon="celebration" fill="lilac" title="Eventos" subtitle={`${home.data?.todayCount ?? 0} planes en tu campus hoy`} onPress={() => router.navigate('/events')} />
      <ModuleRow icon="directions_car" title="Wheels" subtitle="Carpooling a la U" soon onPress={() => router.navigate('/wheels')} />
      <ModuleRow icon="landscape" title="Tours" subtitle="Viajes en grupo" soon onPress={() => router.navigate('/tours')} />
      {home.data?.today.length ? (
        <Text variant="small" tone="muted">
          Próximo hoy: {home.data.today[0].title} · {categoryOf(home.data.today[0].category).label}
        </Text>
      ) : null}
    </Screen>
  );
}

function ModuleRow({ icon, fill, title, subtitle, soon, onPress }: { icon: 'celebration' | 'directions_car' | 'landscape'; fill?: 'lilac'; title: string; subtitle: string; soon?: boolean; onPress: () => void }) {
  return (
    <Card row onPress={onPress} label={`${title}. ${subtitle}`} hint={soon ? 'Disponible pronto' : undefined}>
      <IconTile icon={icon} fill={fill} muted={soon} />
      <View style={{ flex: 1 }}>
        <Text variant="title" tone={soon ? 'muted' : 'default'}>
          {title}
        </Text>
        <Text variant="small" tone="muted">
          {subtitle}
        </Text>
      </View>
      {soon ? <Tag label="Próximamente" soon /> : <Icon name="chevron_right" />}
    </Card>
  );
}
