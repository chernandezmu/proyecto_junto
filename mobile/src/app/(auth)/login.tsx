import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { CodeStep } from '@/components/CodeStep';
import { Button, Field, Header, Screen, Spacer, Text } from '@/components/ui';
import { useOtpFlow } from '@/lib/useOtpFlow';
import { borderWidth, hardShadow } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export default function Login() {
  const { colors } = useTheme();
  const flow = useOtpFlow({ createUser: false });

  return (
    <Screen>
      <Header />
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: 64, height: 64, borderRadius: 18, borderWidth, borderColor: colors.border, boxShadow: hardShadow('md', colors.shadow) }}
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <Text variant="h1">Hola de nuevo</Text>
      <Text tone="muted" style={{ marginTop: -8 }}>
        Te mandamos un código a tu correo de la U.
      </Text>
      {flow.step === 'email' ? (
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
          returnKeyType="send"
          onSubmitEditing={flow.send}
          error={flow.emailError}
        />
      ) : (
        <>
          <CodeStep email={flow.email} code={flow.code} onCode={flow.setCode} error={flow.codeError} wait={flow.wait} onResend={flow.send} onChangeEmail={flow.back} />
          <Text variant="small" tone="muted">
            Si el correo es de El Bosque y tienes cuenta, te llegará un código en un minuto.
          </Text>
        </>
      )}
      <Spacer />
      {flow.step === 'email' ? (
        <Button label="Enviarme el código" iconRight="arrow_forward" onPress={flow.send} loading={flow.busy} disabled={!flow.email.trim()} />
      ) : (
        <Button label="Entrar" iconRight="arrow_forward" onPress={flow.verify} loading={flow.busy} disabled={flow.code.length !== 6} />
      )}
      <Pressable onPress={() => router.replace('/register')} accessibilityRole="link" style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text tone="muted" center>
          ¿No tienes cuenta? <Text style={{ fontFamily: 'Lexend_600SemiBold' }}>Regístrate</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}
