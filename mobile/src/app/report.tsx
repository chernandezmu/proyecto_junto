import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking } from 'react-native';

import { Banner, Button, Card, Chip, Field, Header, Row, Screen, Spacer, StateBlock, Text } from '@/components/ui';
import { api, type ReportReason } from '@/lib/api';
import { friendlyError } from '@/lib/errors';
import { useRefreshPlans } from '@/lib/usePlan';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'acoso', label: 'Acoso o mensajes ofensivos' },
  { value: 'falso', label: 'Plan falso o engañoso' },
  { value: 'peligro', label: 'Peligro para alguien' },
  { value: 'spam', label: 'Spam' },
  { value: 'no_estudiante', label: 'No es estudiante' },
  { value: 'otro', label: 'Otro' },
];

export default function Report() {
  const params = useLocalSearchParams<{ type: 'plan' | 'user' | 'message'; id: string; name?: string; userId?: string }>();
  const refresh = useRefreshPlans();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const who = params.name ?? 'Esa persona';
  const blockId = params.type === 'user' ? params.id : params.userId;

  async function submit() {
    if (!reason) return;
    setBusy(true);
    setError(null);
    try {
      await api.report(params.type, params.id, reason, details);
      setSent(true);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <Screen center>
        <StateBlock
          icon="check"
          fill="mint"
          title="Recibimos tu reporte"
          body={`Lo revisamos en menos de 24 h. ${params.type === 'plan' ? 'El organizador' : who} no sabrá que fuiste tú.`}
          primary={
            blockId
              ? {
                  label: `Bloquear también a ${who}`,
                  icon: 'block',
                  onPress: async () => {
                    await api.block(blockId).catch(() => {});
                    await refresh();
                    router.back();
                  },
                }
              : undefined
          }
          secondary={{ label: 'Volver', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header backIcon="close" backLabel="Cerrar" center="Reportar" />
      <Text variant="h1">¿Qué pasó?</Text>
      {params.name ? (
        <Text tone="muted" style={{ marginTop: -8 }}>
          Sobre: {params.name}
        </Text>
      ) : null}
      {reason === 'peligro' ? (
        <Card fill="coral" hero>
          <Text variant="title" tone="onFill">
            Si estás en peligro ahora, llama al 123.
          </Text>
          <Button label="Llamar al 123" icon="call" variant="secondary" onPress={() => Linking.openURL('tel:123')} />
        </Card>
      ) : null}
      <Row wrap gap={8}>
        {REASONS.map((r) => (
          <Chip key={r.value} label={r.label} selected={reason === r.value} onPress={() => setReason(r.value)} />
        ))}
      </Row>
      <Field label="Cuéntanos más (opcional)" value={details} onChangeText={setDetails} maxLength={500} multiline placeholder="Qué pasó, cuándo y dónde" />
      {error ? <Banner icon="error" fill="coral" title="No se pudo enviar" body={error} /> : null}
      <Spacer />
      <Button label="Enviar reporte" icon="flag" onPress={submit} loading={busy} disabled={!reason} />
    </Screen>
  );
}
