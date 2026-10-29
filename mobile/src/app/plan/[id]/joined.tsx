import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { Button, Card, Icon, LinkButton, Row, Screen, Spacer, StatusIcon, Text, ToggleRow } from '@/components/ui';
import { when } from '@/lib/format';
import { cancelReminder, hasReminder, scheduleReminder } from '@/lib/notifications';
import { usePlan, usePlanId } from '@/lib/usePlan';
import { useTheme } from '@/theme/theme';

export default function Joined() {
  const id = usePlanId();
  const { pending } = useLocalSearchParams<{ pending?: string }>();
  const { colors } = useTheme();
  const plan = usePlan(id);
  const [reminder, setReminder] = useState(false);
  const isPending = pending === '1';

  useEffect(() => {
    hasReminder(id).then(setReminder).catch(() => {});
  }, [id]);

  const p = plan.data;
  const toggleReminder = async (on: boolean) => {
    if (!p) return;
    if (on) setReminder(await scheduleReminder(p).catch(() => false));
    else {
      await cancelReminder(p.id);
      setReminder(false);
    }
  };

  return (
    <Screen center>
      <StatusIcon icon={isPending ? 'hourglass_top' : 'check'} fill={isPending ? 'sky' : 'mint'} />
      <Text variant="h1" center>
        {isPending ? 'Solicitud enviada' : '¡Estás dentro!'}
      </Text>
      {isPending ? (
        <Text tone="muted" center>
          El organizador revisa tu solicitud. Te mostramos su respuesta en Mis planes.
        </Text>
      ) : null}
      {p ? (
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
      ) : null}
      {!isPending ? (
        <Card>
          <ToggleRow icon="alarm" label="Recordatorio 1 h antes" subtitle="Una notificación en este teléfono" value={reminder} onChange={toggleReminder} />
        </Card>
      ) : null}
      <Spacer />
      {!isPending ? <Button label="Saluda en el chat del plan" icon="chat" onPress={() => router.replace(`/plan/${id}/chat`)} /> : null}
      <Button label="Volver al inicio" variant="secondary" onPress={() => router.replace('/home')} />
      <LinkButton label={isPending ? 'Retirar mi solicitud' : 'Cancelar mi asistencia'} onPress={() => router.push(`/plan/${id}/cancel`)} />
    </Screen>
  );
}
