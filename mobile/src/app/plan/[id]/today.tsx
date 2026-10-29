import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform } from 'react-native';

import { Banner, Button, Card, Header, Icon, Row, Screen, Skeleton, Spacer, Tag, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { friendlyError } from '@/lib/errors';
import { remaining, when } from '@/lib/format';
import { useNow } from '@/lib/useNow';
import { usePlan, usePlanId, useRefreshPlans } from '@/lib/usePlan';
import { fills } from '@/theme/tokens';

/** Abre la app de mapas del teléfono buscando el lugar del plan en Bogotá. */
function openMaps(place: string) {
  const q = encodeURIComponent(`${place}, Universidad El Bosque, Bogotá`);
  const url = Platform.OS === 'ios' ? `http://maps.apple.com/?q=${q}` : `geo:0,0?q=${q}`;
  Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`));
}

export default function Today() {
  const id = usePlanId();
  const plan = usePlan(id);
  const refresh = useRefreshPlans();
  const code = useQuery({ queryKey: ['code', id], queryFn: () => api.myCode(id) });
  const [busy, setBusy] = useState<null | 'arrived' | 'late'>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const now = useNow();

  const p = plan.data;
  if (!p) return <Screen><Header /><Skeleton height={300} /></Screen>;
  const start = new Date(p.startsAt);
  const started = start.getTime() <= now;

  async function mark(late: boolean) {
    setBusy(late ? 'late' : 'arrived');
    setError(null);
    try {
      await api.arrived(id, late);
      await refresh(id);
      if (late) setNotice('Le avisamos al grupo en el chat.');
      else router.replace(`/plan/${id}/rate`);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(null);
    }
  }

  const digits = (code.data ?? '····').split('');

  return (
    <Screen>
      <Header center={<Tag label={started ? 'En curso' : `Empieza en ${remaining(start, now)}`} fill="lime" />} />
      <Text variant="h1">{started ? '¡Ya empezó!' : 'Ya casi'}</Text>
      <Card fill="sky">
        <Row gap={10} style={{ alignItems: 'flex-start' }}>
          <Icon name="location_on" color={fills.onFill} />
          <Text variant="title" tone="onFill" style={{ flex: 1 }}>
            {p.place}
          </Text>
        </Row>
        <Text variant="small" tone="onFill">
          {when(p.startsAt)}
        </Text>
        <Button label="Abrir en Maps" icon="map" variant="secondary" onPress={() => openMaps(p.place)} />
      </Card>
      <Card style={{ alignItems: 'center' }}>
        <Text variant="label">Tu código de asistencia</Text>
        <Text variant="code" tabular accessibilityLabel={code.data ? `Tu código: ${digits.join(', ')}` : 'Cargando tu código'}>
          {code.data ?? '····'}
        </Text>
        <Text variant="small" tone="muted" center>
          Muéstraselo al organizador al llegar.
        </Text>
      </Card>
      {notice ? <Banner icon="check_circle" fill="mint" title={notice} /> : null}
      {error ? <Banner icon="error" fill="coral" title="No se pudo avisar" body={error} /> : null}
      <Spacer />
      <Button label={p.arrived ? 'Ya avisaste que llegaste' : 'Ya llegué'} icon="where_to_vote" onPress={() => mark(false)} loading={busy === 'arrived'} disabled={!!p.arrived} />
      <Button label="Avisar que voy tarde" variant="secondary" onPress={() => mark(true)} loading={busy === 'late'} />
    </Screen>
  );
}
