import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui';

// En la web, NetInfo prueba la conexión pidiendo la raíz del dominio y exige un 200. En GitHub
// Pages esa raíz no es de la app (responde 404) y marcaría "Sin conexión" siempre, pausando
// todas las consultas. Cualquier respuesta del servidor ya demuestra que hay internet.
if (Platform.OS === 'web') NetInfo.configure({ reachabilityTest: async (res) => res.status > 0 && res.status < 500 });

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
