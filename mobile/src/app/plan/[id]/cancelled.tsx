import { router } from 'expo-router';

import { Screen, StateBlock } from '@/components/ui';
import { usePlan, usePlanId } from '@/lib/usePlan';

export default function Cancelled() {
  const id = usePlanId();
  const plan = usePlan(id);
  const title = plan.data?.title ?? 'el plan';
  return (
    <Screen center>
      <StateBlock
        icon="event_busy"
        fill="coral"
        title="Asistencia cancelada"
        body={`Liberaste tu cupo en ${title}. Le avisamos al organizador y saliste del chat.`}
        primary={{ label: 'Ver otros planes', onPress: () => router.replace('/events/feed') }}
        secondary={{ label: 'Volver al inicio', onPress: () => router.replace('/home') }}
      />
    </Screen>
  );
}
