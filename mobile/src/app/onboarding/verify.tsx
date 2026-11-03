import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { IdScanner } from '@/components/IdScanner';
import { Banner, Button, Checkbox, Field, Icon, LinkButton, Row, Screen, Spacer, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { errorCode, friendlyError } from '@/lib/errors';
import { birthDate, isAdult, isoDate } from '@/lib/format';
import { pickIdDocument, removeIdDocument, uploadIdDocument, type PickedFile } from '@/lib/media';
import { borderWidth, fills, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export default function Verify() {
  const { colors } = useTheme();
  const { me, refreshMe, signOut } = useAuth();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [studentCode, setStudentCode] = useState('');
  const [birth, setBirth] = useState<Date | null>(null);
  const [consent, setConsent] = useState(!!me?.consented);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const maxBirth = new Date();
  maxBirth.setFullYear(maxBirth.getFullYear() - 16);
  const underage = !!birth && !isAdult(birth);
  const ready = !!file && studentCode.trim().length >= 3 && !!birth && !underage && consent;

  async function pickFile() {
    try {
      const f = await pickIdDocument('file');
      if (f) setFile(f);
    } catch (e) {
      Alert.alert('No pudimos abrir el archivo', friendlyError(e, (e as Error).message));
    }
  }

  async function submit() {
    if (!me || !file || !birth) return;
    setBusy(true);
    setError(null);
    let path: string | null = null;
    try {
      if (!me.consented) await api.recordConsent();
      path = await uploadIdDocument(me.id, file);
      await api.submitVerification(isoDate(birth), studentCode.trim(), path);
      await refreshMe();
      router.replace('/onboarding/profile');
    } catch (e) {
      if (path) await removeIdDocument(path).catch(() => {});
      if (errorCode(e) === 'UNDERAGE') {
        Alert.alert('Junto es para mayores de 18', 'Cuando cumplas 18 te esperamos. No guardamos el carné que enviaste.', [{ text: 'Entendido', onPress: () => signOut() }]);
      } else {
        setError(friendlyError(e, (e as Error).message));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Row justify="center" style={{ minHeight: 48 }}>
        <Text variant="label">Paso 2 de 3</Text>
      </Row>
      <Text variant="h1">Verifica que eres estudiante</Text>
      {me?.verification === 'rejected' ? (
        <Banner
          icon="badge"
          fill="peach"
          title="No pudimos validar tu carné"
          body={`${me.rejectionReason ?? 'La foto no se veía bien'}. Súbelo de nuevo y lo revisamos otra vez.`}
        />
      ) : (
        <Text tone="muted" style={{ marginTop: -8 }}>
          Escanea tu carné vigente con la cámara.
        </Text>
      )}

      {file ? (
        <View style={{ gap: 8 }}>
          {file.mimeType.startsWith('image/') ? (
            <Pressable onPress={() => setScanning(true)} accessibilityRole="button" accessibilityLabel="Carné escaneado. Toca para volver a escanear">
              <Image
                source={{ uri: file.uri }}
                style={{ width: '100%', aspectRatio: 85.6 / 54, borderRadius: radius.md, borderWidth, borderColor: colors.border }}
                contentFit="cover"
              />
              <View style={{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: fills.mint, borderWidth, borderColor: fills.onFill, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Icon name="check_circle" size={16} color={fills.onFill} />
                <Text variant="tag" tone="onFill">
                  Listo
                </Text>
              </View>
            </Pressable>
          ) : (
            <View style={{ height: 120, borderRadius: radius.md, borderWidth, borderColor: colors.border, backgroundColor: fills.mint, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 }}>
              <Icon name="check_circle" size={40} color={fills.onFill} />
              <Text tone="onFill" style={{ fontFamily: 'Lexend_600SemiBold' }} numberOfLines={1}>
                {file.name} · listo
              </Text>
            </View>
          )}
          <Row justify="center" gap={16}>
            <LinkButton label="Volver a escanear" onPress={() => setScanning(true)} />
            <LinkButton label="Quitar" onPress={() => setFile(null)} />
          </Row>
        </View>
      ) : (
        <Pressable
          onPress={() => setScanning(true)}
          accessibilityRole="button"
          accessibilityLabel="Escanear mi carné con la cámara"
          style={({ pressed }) => ({
            aspectRatio: 85.6 / 54,
            borderRadius: radius.md,
            borderWidth,
            borderStyle: 'dashed',
            borderColor: colors.border,
            backgroundColor: pressed ? fills.sky : colors.muted,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 16,
          })}
        >
          <Icon name="badge" size={44} />
          <Text variant="title" center>
            Toca para escanear tu carné
          </Text>
          <Text variant="small" tone="muted" center>
            Se abre la cámara con un marco para encuadrarlo
          </Text>
        </Pressable>
      )}
      {!file ? <LinkButton label="¿Tienes certificado de matrícula en PDF? Sube un archivo" onPress={pickFile} /> : null}
      <IdScanner visible={scanning} onClose={() => setScanning(false)} onCapture={setFile} onPickFile={pickFile} />

      <Field label="Código estudiantil" placeholder="Ej. 20231234" value={studentCode} onChangeText={setStudentCode} autoCapitalize="none" autoCorrect={false} />
      <DateField
        label="Fecha de nacimiento"
        value={birth}
        onChange={setBirth}
        placeholder="DD / MM / AAAA"
        format={birthDate}
        maximumDate={maxBirth}
        minimumDate={new Date(1940, 0, 1)}
        helper="Debes tener 18 años o más."
        error={underage ? 'Junto es para mayores de 18 años.' : null}
      />

      {!me?.consented ? (
        <Checkbox checked={consent} onChange={setConsent} label="Autorizo el tratamiento de mis datos">
          <Text variant="small">Autorizo el tratamiento de mis datos según la Política de datos y acepto las Normas de la comunidad.</Text>
        </Checkbox>
      ) : null}

      <Row style={{ alignItems: 'flex-start' }}>
        <Icon name="lock" color={colors.mutedForeground} />
        <Text variant="small" tone="muted" style={{ flex: 1 }}>
          Solo lo usamos para validar tu identidad y lo borramos 30 días después de revisarlo. Revisión en menos de 24 h.
        </Text>
      </Row>
      {error ? <Banner icon="error" fill="coral" title="No se pudo enviar" body={error} /> : null}
      <Spacer />
      <Button label="Enviar a verificación" onPress={submit} loading={busy} disabled={!ready} />
    </Screen>
  );
}
