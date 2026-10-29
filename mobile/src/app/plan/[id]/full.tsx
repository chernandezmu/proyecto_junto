import { router } from 'expo-router';

import { Card, Screen, StateBlock, ToggleRow } from '@/components/ui';
import { api } from '@/lib/api';
import { usePlan, usePlanId, useRefreshPlans } from '@/lib/usePlan';

export default function PlanFull() {
  const id = usePlanId();
  const plan = usePlan(id);
  const refresh = useRefreshPlans();
  const on = !!plan.data?.onWaitlist;

  return (
    <Screen center>
      <StateBlock
        icon="event_busy"
        fill="peach"
        title="Este plan se llenó"
        body={`${plan.data?.title ?? 'Este plan'} ya no tiene cupos. Te avisamos si alguien cancela.`}
        extra={
          <Card>
            <ToggleRow
              icon="notifications_active"
              label="Avisarme si se libera"
              value={on}
              onChange={async (v) => {
                await api.setWaitlist(id, v).catch(() => {});
                refresh(id);
              }}
            />
          </Card>
        }
        primary={{ label: 'Ver otros planes', onPress: () => router.replace('/events/feed') }}
      />
    </Screen>
  );
}
