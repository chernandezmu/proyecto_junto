import { router } from 'expo-router';

import { Screen, StateBlock } from '@/components/ui';

export default function NotFound() {
  return (
    <Screen center>
      <StateBlock
        icon="link_off"
        fill="peach"
        title="Este enlace no lleva a ningún lado"
        body="Puede que el plan se haya borrado o que el enlace esté mal escrito."
        primary={{ label: 'Volver al inicio', onPress: () => router.replace('/') }}
      />
    </Screen>
  );
}
