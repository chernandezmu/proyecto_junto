import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui';

/** Aviso superior "Sin conexión" y pausa de consultas mientras no hay red. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(
    () =>
      NetInfo.addEventListener((s) => {
        const isOffline = s.isConnected === false || s.isInternetReachable === false;
        setOffline(isOffline);
        onlineManager.setOnline(!isOffline);
      }),
    [],
  );

  if (!offline) return null;
  return (
    <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, zIndex: 100 }} pointerEvents="none">
      <Banner icon="cloud_off" fill="peach" title="Sin conexión" body="Lo que ves puede no estar al día. Reintentamos solos." />
    </View>
  );
}
