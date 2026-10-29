import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { Banner, Button, Checkbox, Field, Icon, Row, Screen, Spacer, Text } from '@/components/ui';
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

  const maxBirth = new Date();
  maxBirth.setFullYear(maxBirth.getFullYear() - 16);
  const underage = !!birth && !isAdult(birth);
  const ready = !!file && studentCode.trim().length >= 3 && !!birth && !underage && consent;

  async function choose(source: 'camera' | 'file') {
    try {
      const f = await pickIdDocument(source);
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
          Sube tu carné o certificado de matrícula vigente.
        </Text>
      )}

      {file ? (
        <View style={{ height: 150, borderRadius: radius.md, borderWidth, borderColor: colors.border, backgroundColor: fills.mint, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 }}>
          <Icon name="check_circle" size={40} color={fills.onFill} />
          <Text tone="onFill" style={{ fontFamily: 'Lexend_600SemiBold' }} numberOfLines={1}>
            {file.name} · listo
          </Text>
          <Pressable onPress={() => setFile(null)} accessibilityRole="button" hitSlop={8}>
            <Text variant="small" tone="onFill" style={{ textDecorationLine: 'underline' }}>
              Cambiar archivo
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ borderRadius: radius.md, borderWidth, borderColor: colors.border, backgroundColor: colors.muted, padding: 16, gap: 12, alignItems: 'center' }}>
          <Icon name="badge" size={44} />
          <Text variant="small" tone="muted" center>
            JPG, PNG o PDF · máx. 10 MB
          </Text>
          <Row gap={10}>
            <Button label="Tomar foto" icon="photo_camera" variant="secondary" onPress={() => choose('camera')} flex />
            <Button label="Elegir archivo" icon="upload_file" variant="secondary" onPress={() => choose('file')} flex />
          </Row>
        </View>
      )}

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
