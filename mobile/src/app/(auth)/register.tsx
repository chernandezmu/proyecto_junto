import { Link } from 'expo-router';
import { useState } from 'react';

import { CodeStep } from '@/components/CodeStep';
import { Button, Checkbox, Field, Header, Screen, Spacer, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { useOtpFlow } from '@/lib/useOtpFlow';

export default function Register() {
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const flow = useOtpFlow({
    createUser: true,
    // Con la sesión creada, guardamos la autorización (Ley 1581) antes de seguir.
    onVerified: async () => {
      await api.recordConsent().catch(() => {});
    },
  });

  const send = () => {
    if (!consent) {
      setConsentError('Para crear tu cuenta necesitamos tu autorización de datos.');
      return;
    }
    flow.send();
  };

  return (
    <Screen>
      <Header center="Paso 1 de 3" />
      <Text variant="h1">Tu correo de la universidad</Text>
      <Text tone="muted" style={{ marginTop: -8 }}>
        Así sabemos que todos aquí son estudiantes.
      </Text>
      {flow.step === 'email' ? (
        <>
          <Field
            label="Correo"
            placeholder="nombre@unbosque.edu.co"
            value={flow.email}
            onChangeText={flow.setEmail}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoCorrect={false}
            error={flow.emailError}
          />
          <Checkbox
            checked={consent}
            onChange={(v) => {
              setConsent(v);
              setConsentError(null);
            }}
            label="Autorizo el tratamiento de mis datos y acepto las normas de la comunidad"
          >
            <Text variant="small">
              Autorizo el tratamiento de mis datos según la{' '}
              <Link href="/legal/privacidad" style={{ textDecorationLine: 'underline' }}>
                Política de datos
              </Link>{' '}
              y acepto las{' '}
              <Link href="/legal/normas" style={{ textDecorationLine: 'underline' }}>
                Normas de la comunidad
              </Link>
              .
            </Text>
            {consentError ? (
              <Text variant="small" tone="danger" style={{ marginTop: 4 }}>
                {consentError}
              </Text>
            ) : null}
          </Checkbox>
        </>
      ) : (
        <CodeStep email={flow.email} code={flow.code} onCode={flow.setCode} error={flow.codeError} wait={flow.wait} onResend={flow.send} onChangeEmail={flow.back} />
      )}
      <Spacer />
      {flow.step === 'email' ? (
        <Button label="Enviarme el código" icon="mail" onPress={send} loading={flow.busy} disabled={!flow.email.trim()} />
      ) : (
        <Button label="Validar código" onPress={flow.verify} loading={flow.busy} disabled={flow.code.length !== 6} />
      )}
    </Screen>
  );
}
