import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { categoryOf, PlanStatusTag } from '@/components/plan';
import { Banner, Button, Card, ErrorCard, Header, Icon, Row, Screen, Skeleton, Spacer, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { friendlyError } from '@/lib/errors';
import { cancelBy, time, when } from '@/lib/format';
import { scheduleReminder } from '@/lib/notifications';
import { usePlan, usePlanId, useRefreshPlans } from '@/lib/usePlan';
import { fills } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export default function JoinConfirm() {
  const id = usePlanId();
  const { colors } = useTheme();
  const { me } = useAuth();
  const plan = usePlan(id);
  const refresh = useRefreshPlans();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (plan.isLoading) return <Screen><Header backIcon="close" /><Skeleton height={300} /></Screen>;
  if (!plan.data) return <Screen><Header backIcon="close" /><ErrorCard message={friendlyError(plan.error)} onRetry={plan.refetch} /></Screen>;
  const p = plan.data;
  const c = categoryOf(p.category);
  const approval = p.access === 'approval';

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const r = await api.join(p.id);
      await refresh(p.id);
      if (r.status === 'full') return router.replace(`/plan/${p.id}/full`);
      if (r.status === 'joined' && me?.remindersEnabled) await scheduleReminder(p).catch(() => false);
      router.replace({ pathname: '/plan/[id]/joined', params: { id: p.id, pending: r.status === 'pending' ? '1' : '0' } });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Header backIcon="close" backLabel="Cerrar" center="Confirmar inscripción" />
      <Text variant="h1">{approval ? '¿Pedimos tu cupo?' : '¿Te inscribimos?'}</Text>
      <Card fill={c.fill} hero>
        <Row justify="space-between">
          <Text variant="label" tone="onFill">
            {when(p.startsAt)}
          </Text>
          <Icon name={c.icon} color={fills.onFill} />
        </Row>
        <Text variant="h2" tone="onFill">
          {p.title}
        </Text>
        <Row gap={6}>
          <Icon name="location_on" size="sm" color={fills.onFill} />
          <Text variant="small" tone="onFill" style={{ flex: 1 }}>
            {p.place}
          </Text>
        </Row>
      </Card>
      <Card>
        <Row gap={12}>
          <Icon name="event_seat" />
          <Text variant="title" style={{ flex: 1 }}>
            Cupos disponibles
          </Text>
          <PlanStatusTag plan={p} />
        </Row>
        <Row gap={12} style={{ alignItems: 'flex-start' }}>
          <Icon name="timer" />
          <View style={{ flex: 1 }}>
            <Text variant="title">Cancelación gratis</Text>
            <Text variant="small" tone="muted">
              Hasta {when(cancelBy(p.startsAt, p.cancelHours))}
            </Text>
          </View>
        </Row>
        <Row gap={12} style={{ alignItems: 'flex-start' }}>
          <Icon name="groups" />
          <View style={{ flex: 1 }}>
            <Text variant="title">{approval ? 'El organizador revisa tu solicitud' : 'Te unes al chat del plan'}</Text>
            <Text variant="small" tone="muted">
              El organizador verá tu perfil
            </Text>
          </View>
        </Row>
        {me?.remindersEnabled ? (
          <Row gap={12} style={{ alignItems: 'flex-start' }}>
            <Icon name="alarm" />
            <View style={{ flex: 1 }}>
              <Text variant="title">Te recordamos a las {time(new Date(new Date(p.startsAt).getTime() - 3_600_000))}</Text>
              <Text variant="small" tone="muted">
                Una hora antes, en este teléfono
              </Text>
            </View>
          </Row>
        ) : null}
      </Card>
      <Row style={{ alignItems: 'flex-start' }}>
        <Icon name="info" color={colors.mutedForeground} />
        <Text variant="small" tone="muted" style={{ flex: 1 }}>
          Si no asistes sin cancelar a tiempo, baja tu calificación en la comunidad.
        </Text>
      </Row>
      {error ? <Banner icon="error" fill="coral" title="No pudimos inscribirte" body={error} /> : null}
      <Spacer />
      <Button label={approval ? 'Sí, enviar mi solicitud' : 'Sí, confirmar mi cupo'} icon="check" variant="success" onPress={confirm} loading={busy} />
      <Button label="No, volver al feed" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
