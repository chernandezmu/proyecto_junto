import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { RequestRow } from '@/components/RequestRow';
import { Banner, Button, Card, ErrorCard, Field, Header, LinkButton, Row, Screen, Skeleton, Tag, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { friendlyError } from '@/lib/errors';
import { when } from '@/lib/format';
import { usePlan, usePlanId, useRefreshPlans } from '@/lib/usePlan';

export default function Manage() {
  const id = usePlanId();
  const plan = usePlan(id);
  const refresh = useRefreshPlans();
  const people = useQuery({ queryKey: ['requests', id], queryFn: () => api.requests(id) });
  const [pinned, setPinned] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const p = plan.data;
  if (plan.isLoading) return <Screen><Header /><Skeleton height={160} /></Screen>;
  if (!p) return <Screen><Header /><ErrorCard message={friendlyError(plan.error)} onRetry={plan.refetch} /></Screen>;

  const pending = (people.data ?? []).filter((r) => r.status === 'pending');
  const others = (people.data ?? []).filter((r) => r.status !== 'pending');
  const pinnedValue = pinned ?? p.pinned ?? '';

  async function respond(userId: string, accept: boolean) {
    setError(null);
    try {
      await api.respond(id, userId, accept);
      await Promise.all([people.refetch(), refresh(id)]);
    } catch (e) {
      setError(friendlyError(e));
    }
  }

  async function savePinned() {
    setSaving(true);
    try {
      await api.setPinned(id, pinnedValue);
      await refresh(id);
      setPinned(null);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  function cancelPlan() {
    Alert.alert('¿Cancelar el plan?', 'Les avisamos a las personas inscritas en el chat. No se puede deshacer.', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Sí, cancelar el plan',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.cancelPlan(id);
            await refresh(id);
            router.replace('/mine');
          } catch (e) {
            setError(friendlyError(e));
          }
        },
      },
    ]);
  }

  return (
    <Screen refreshing={people.isRefetching} onRefresh={() => Promise.all([people.refetch(), plan.refetch()])}>
      <Header center={<Tag label={p.status === 'published' ? 'Publicado' : p.status === 'cancelled' ? 'Cancelado' : 'Terminado'} fill={p.status === 'published' ? 'mint' : p.status === 'cancelled' ? 'coral' : 'sky'} />} />
      <Card fill="lilac" hero>
        <Text variant="label" tone="onFill">
          {when(p.startsAt)} · organizas tú
        </Text>
        <Text variant="h2" tone="onFill">
          {p.title}
        </Text>
        <Row gap={18}>
          <Text variant="small" tone="onFill">
            {p.joined}/{p.capacity} unidos
          </Text>
          {pending.length ? (
            <Text variant="small" tone="onFill">
              {pending.length} {pending.length === 1 ? 'solicitud' : 'solicitudes'}
            </Text>
          ) : null}
        </Row>
      </Card>

      {p.status === 'published' ? (
        <Card>
          <Field label="Mensaje fijado del chat" value={pinnedValue} onChangeText={setPinned} maxLength={200} placeholder="Hora y punto de encuentro" />
          {pinned !== null && pinned !== (p.pinned ?? '') ? <Button label="Guardar mensaje fijado" variant="secondary" onPress={savePinned} loading={saving} /> : null}
        </Card>
      ) : null}

      {error ? <Banner icon="error" fill="coral" title="No se pudo completar" body={error} /> : null}

      {p.access === 'approval' ? (
        <>
          <Row justify="space-between">
            <Text variant="label">Solicitudes</Text>
            <Text variant="label">{pending.length} pendientes</Text>
          </Row>
          {people.isLoading ? <Skeleton height={70} /> : pending.length ? pending.map((r) => <RequestRow key={r.id} r={r} onAccept={() => respond(r.id, true)} onReject={() => respond(r.id, false)} />) : (
            <Text variant="small" tone="muted">
              Todavía no hay solicitudes. Aparecen aquí cuando alguien quiera unirse.
            </Text>
          )}
        </>
      ) : null}

      <Text variant="label">Inscritos</Text>
      {people.isLoading ? (
        <Skeleton height={70} />
      ) : people.isError ? (
        <ErrorCard onRetry={people.refetch} />
      ) : others.length ? (
        others.map((r) => <RequestRow key={r.id} r={r} />)
      ) : (
        <Text variant="small" tone="muted">
          Aún no se ha unido nadie. Comparte el plan para que llegue más gente.
        </Text>
      )}

      {p.status === 'published' ? (
        <>
          <Button label="Día del plan · validar asistencia" icon="where_to_vote" onPress={() => router.push(`/plan/${id}/check-in`)} />
          <Button label="Ir al chat del plan" icon="chat" variant="secondary" onPress={() => router.push(`/plan/${id}/chat`)} />
          <LinkButton label="Cancelar el plan" onPress={cancelPlan} />
        </>
      ) : null}
    </Screen>
  );
}
