import { View } from 'react-native';

import { OtpInput } from './OtpInput';
import { Card, Icon, LinkButton, Row, Text } from '@/components/ui';
import { useTheme } from '@/theme/theme';

/** Tarjeta "Código enviado a…" con las 6 casillas, error y reenvío. */
export function CodeStep({
  email,
  code,
  onCode,
  error,
  wait,
  onResend,
  onChangeEmail,
}: {
  email: string;
  code: string;
  onCode: (v: string) => void;
  error: string | null;
  wait: number;
  onResend: () => void;
  onChangeEmail: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Card>
      <Row justify="space-between">
        <Text variant="label">Código enviado a</Text>
        <LinkButton label="Cambiar" onPress={onChangeEmail} center={false} />
      </Row>
      <Text variant="title" style={{ marginTop: -8 }}>
        {email.trim().toLowerCase()}
      </Text>
      <OtpInput value={code} onChange={onCode} autoFocus error={!!error} />
      {error ? (
        <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLiveRegion="polite">
          <Icon name="error" size="sm" color={colors.destructiveText} />
          <Text variant="small" tone="danger" style={{ flex: 1 }}>
            {error}
          </Text>
        </View>
      ) : null}
      {wait > 0 ? (
        <Text variant="small" tone="muted">
          Reenviar código en 0:{String(wait).padStart(2, '0')}
        </Text>
      ) : (
        <LinkButton label="Reenviar código" onPress={onResend} center={false} />
      )}
    </Card>
  );
}
