import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { OtpInput } from '@/components/OtpInput';
import { RequestRow } from '@/components/RequestRow';
import { Banner, Button, Card, ErrorCard, Header, Row, Screen, Skeleton, Tag, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { friendlyError } from '@/lib/errors';
import { remaining } from '@/lib/format';
import { useNow } from '@/lib/useNow';
import { usePlan, usePlanId, useRefreshPlans } from '@/lib/usePlan';

export default function CheckIn() {
  const id = usePlanId();
  const plan = usePlan(id);
  const refresh = useRefreshPlans();
  const people = useQuery({ queryKey: ['requests', id], queryFn: () => api.requests(id) });
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const now = useNow();

  const p = plan.data;
  const joined = (people.data ?? []).filter((r) => r.status === 'joined');
  const arrived = joined.filter((r) => r.checkedIn).length;

  async function validate(value = code) {
    if (value.length !== 4 || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await api.checkIn(id, value);
      if ('error' in res) {
        setResult({ ok: false, text: friendlyError(new Error(res.error)) });
        setCode('');
        return;
      }
      setResult({ ok: true, text: `¡${res.name} llegó!` });
      setCode('');
      await people.refetch();
    } catch (e) {
      setResult({ ok: false, text: friendlyError(e) });
      setCode('');
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    Alert.alert('¿Terminar el plan?', 'Se habilita la calificación para todos y el plan pasa a Pasados.', [
      { text: 'Todavía no', style: 'cancel' },
      {
        text: 'Terminar',
        onPress: async () => {
          try {
            await api.finishPlan(id);
            await refresh(id);
            router.replace(`/plan/${id}/rate`);
          } catch (e) {
            setResult({ ok: false, text: friendlyError(e) });
          }
        },
      },
    ]);
  }

  if (!p) return <Screen><Header /><Skeleton height={220} /></Screen>;
  const start = new Date(p.startsAt);

  return (
    <Screen refreshing={people.isRefetching} onRefresh={people.refetch}>
      <Header center={<Tag label={start.getTime() <= now ? 'En curso' : `Empieza en ${remaining(start, now)}`} fill="lime" />} />
      <Text variant="h1">¿Quién llegó?</Text>
      <Text variant="small" tone="muted" style={{ marginTop: -8 }}>
        Pídele a cada persona su código de 4 dígitos.
      </Text>
      <Card>
        <OtpInput
          value={code}
          length={4}
          onChange={(v) => {
            setCode(v);
            if (v.length === 4) validate(v);
          }}
          error={result?.ok === false}
        />
        <Button label="Validar" onPress={() => validate()} loading={busy} disabled={code.length !== 4} />
      </Card>
      {result ? <Banner icon={result.ok ? 'check_circle' : 'error'} fill={result.ok ? 'mint' : 'coral'} title={result.text} /> : null}
      <Row justify="space-between">
        <Text variant="label">Inscritos</Text>
        <Text variant="label">
          {arrived} de {joined.length} llegaron
        </Text>
      </Row>
      {people.isLoading ? <Skeleton height={70} /> : people.isError ? <ErrorCard onRetry={people.refetch} /> : joined.map((r) => <RequestRow key={r.id} r={r} />)}
      <Button label="Terminar el plan" variant="secondary" onPress={finish} />
    </Screen>
  );
}
