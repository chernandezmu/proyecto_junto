import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Banner, Button, Card, Chip, Header, Icon, Row, Screen, Skeleton, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { friendlyError } from '@/lib/errors';
import { cancelBy, remaining, when } from '@/lib/format';
import { cancelReminder } from '@/lib/notifications';
import { useNow } from '@/lib/useNow';
import { usePlan, usePlanId, useRefreshPlans } from '@/lib/usePlan';
import { fills } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

const REASONS = ['Me cruzo con clase', 'Me enfermé', 'Cambio de planes', 'Otro'];

export default function Cancel() {
  const id = usePlanId();
  const { colors } = useTheme();
  const plan = usePlan(id);
  const refresh = useRefreshPlans();
  const [reason, setReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = useNow();

  const p = plan.data;
  if (!p) return <Screen><Header /><Skeleton height={200} /></Screen>;
  const pending = p.myStatus === 'pending';
  const limit = cancelBy(p.startsAt, p.cancelHours);
  const onTime = pending || limit.getTime() > now;

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      await api.cancelAttendance(id, reason);
      await cancelReminder(id);
      await refresh(id);
      router.replace(`/plan/${id}/cancelled`);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Header center={pending ? 'Retirar solicitud' : 'Cancelar asistencia'} />
      <Card>
        <Text variant="label">{when(p.startsAt)}</Text>
        <Text variant="h2">{p.title}</Text>
        <Row gap={6}>
          <Icon name="location_on" size="sm" color={colors.mutedForeground} />
          <Text variant="small" tone="muted" style={{ flex: 1 }}>
            {p.place}
          </Text>
        </Row>
      </Card>
      {onTime ? (
        <>
          {!pending ? (
            <Card fill="mint" hero row>
              <Icon name="timer" size={32} color={fills.onFill} />
              <View style={{ flex: 1 }}>
                <Text variant="title" tone="onFill">
                  Aún estás a tiempo
                </Text>
                <Text variant="small" tone="onFill">
                  Puedes cancelar sin penalización hasta {when(limit)} · quedan {remaining(limit, now)}
                </Text>
              </View>
            </Card>
          ) : null}
          <Text variant="label">¿Por qué {pending ? 'la retiras' : 'cancelas'}? (opcional)</Text>
          <Row wrap gap={8}>
            {REASONS.map((r) => (
              <Chip key={r} label={r} selected={reason === r} onPress={() => setReason(reason === r ? null : r)} />
            ))}
          </Row>
          {error ? <Banner icon="error" fill="coral" title="No se pudo cancelar" body={error} /> : null}
          <Button label={pending ? 'Sí, retirar mi solicitud' : 'Sí, cancelar mi asistencia'} icon="event_busy" variant="danger" onPress={cancel} loading={busy} />
          <Button label={pending ? 'Mejor la dejo' : 'Mejor sigo inscrito'} variant="secondary" onPress={() => router.back()} />
        </>
      ) : (
        <>
          <Card fill="peach" hero row>
            <Icon name="lock_clock" size={32} color={fills.onFill} />
            <View style={{ flex: 1 }}>
              <Text variant="title" tone="onFill">
                Ya pasó el límite
              </Text>
              <Text variant="small" tone="onFill">
                La cancelación cerraba {when(limit)}. Avísale al organizador si no puedes ir.
              </Text>
            </View>
          </Card>
          <Button label="Avisar en el chat del plan" icon="chat" onPress={() => router.replace(`/plan/${id}/chat`)} />
          <Button label="Volver" variant="secondary" onPress={() => router.back()} />
        </>
      )}
    </Screen>
  );
}
