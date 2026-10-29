import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { PlanRow } from '@/components/plan';
import { Card, ErrorCard, RootHeader, Screen, Segmented, Skeleton, StateBlock } from '@/components/ui';
import { api, type PlanCard } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { mediaUrl } from '@/lib/supabase';

type Tab = 'upcoming' | 'organizing' | 'past';

const EMPTY: Record<Tab, { title: string; body: string; cta: string; to: '/events/feed' | '/events/create' }> = {
  upcoming: { title: 'No tienes planes próximos', body: 'Únete a uno de tu campus en un toque.', cta: 'Descubrir planes', to: '/events/feed' },
  organizing: { title: 'No has creado planes', body: 'Arma uno y deja que la gente llegue.', cta: 'Crear un plan', to: '/events/create' },
  past: { title: 'Aquí verás los planes a los que fuiste', body: 'Cuando termines tu primer plan, aparecerá aquí.', cta: 'Descubrir planes', to: '/events/feed' },
};

/** A dónde lleva cada plan según el rol y el momento. */
function openPlan(p: PlanCard) {
  if (p.isOrganizer && p.status === 'published') return router.push(`/plan/${p.id}/manage`);
  if (p.status === 'finished') return router.push(`/plan/${p.id}/rate`);
  if (p.myStatus === 'joined' && p.status === 'published') return router.push(`/plan/${p.id}/chat`);
  return router.push(`/plan/${p.id}`);
}

export default function Mine() {
  const { me } = useAuth();
  const [tab, setTab] = useState<Tab>('upcoming');
  const list = useQuery({ queryKey: ['myPlans', tab], queryFn: () => api.myPlans(tab) });
  if (!me) return null;
  const empty = EMPTY[tab];

  return (
    <Screen tab refreshing={list.isRefetching} onRefresh={list.refetch}>
      <RootHeader title="Mis planes" name={me.fullName} photoUrl={mediaUrl(me.photo)} />
      <Segmented
        label="Mis planes"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'upcoming', label: 'Próximos' },
          { value: 'organizing', label: 'Organizo' },
          { value: 'past', label: 'Pasados' },
        ]}
      />
      {list.isLoading ? (
        <>
          <Skeleton height={76} />
          <Skeleton height={76} />
          <Skeleton height={76} />
        </>
      ) : list.isError ? (
        <ErrorCard onRetry={list.refetch} />
      ) : list.data?.length ? (
        list.data.map((p) => <PlanRow key={p.id} plan={p} onPress={() => openPlan(p)} />)
      ) : (
        <Card>
          <StateBlock
            icon="event_note"
            fill="lilac"
            title={empty.title}
            body={empty.body}
            primary={tab === 'organizing' && me.verification !== 'approved' ? undefined : { label: empty.cta, onPress: () => router.push(empty.to) }}
          />
        </Card>
      )}
    </Screen>
  );
}
