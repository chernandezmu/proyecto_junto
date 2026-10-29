import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { PlanRow } from '@/components/plan';
import { Card, ErrorCard, Icon, LinkButton, RootHeader, Row, Screen, Skeleton, StateBlock, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { mediaUrl } from '@/lib/supabase';
import { fills } from '@/theme/tokens';

export default function Events() {
  const { me } = useAuth();
  const home = useQuery({ queryKey: ['home'], queryFn: api.home });
  if (!me) return null;
  const today = home.data?.today ?? [];

  return (
    <Screen tab fabClearance refreshing={home.isRefetching} onRefresh={home.refetch}>
      <RootHeader title="Eventos" name={me.fullName} photoUrl={mediaUrl(me.photo)} />
      <Card fill="lilac" onPress={() => router.push('/events/feed')} label="Descubrir planes" hint="Desliza entre los planes de tu campus">
        <Icon name="swipe" size={40} color={fills.onFill} />
        <Text variant="h2" tone="onFill">
          Descubrir planes
        </Text>
        <Text tone="onFill">Desliza entre los planes de tu campus y únete en un toque.</Text>
      </Card>
      <Row justify="space-between">
        <Text variant="label">Hoy en tu campus</Text>
        <LinkButton label="Ver todos" onPress={() => router.push('/events/feed')} center={false} />
      </Row>
      {home.isLoading ? (
        <>
          <Skeleton height={76} />
          <Skeleton height={76} />
        </>
      ) : home.isError ? (
        <ErrorCard onRetry={home.refetch} />
      ) : today.length ? (
        today.map((p) => <PlanRow key={p.id} plan={p} onPress={() => router.push(`/plan/${p.id}`)} />)
      ) : (
        <Card>
          <StateBlock
            icon="event_available"
            fill="lilac"
            title="Todavía no hay planes hoy"
            body="Sé la primera persona en armar uno: los planes nuevos le aparecen a todo tu campus."
            primary={me.verification === 'approved' ? { label: 'Crear un plan', icon: 'add', onPress: () => router.push('/events/create') } : undefined}
          />
        </Card>
      )}
    </Screen>
  );
}
