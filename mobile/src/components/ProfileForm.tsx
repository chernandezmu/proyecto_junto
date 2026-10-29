import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Avatar, Button, Chip, Field, Icon, Row, Spacer, Stepper, Text } from '@/components/ui';
import { api, type Me } from '@/lib/api';
import { friendlyError } from '@/lib/errors';
import { pickPhoto, uploadPhoto } from '@/lib/media';
import { mediaUrl } from '@/lib/supabase';
import { categories, categoryKeys, fills } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export const INTERESTS = categoryKeys.map((k) => categories[k].label);

/** Formulario de perfil (registro paso 3 y "Editar perfil"). */
export function ProfileForm({ me, submitLabel, onDone }: { me: Me; submitLabel: string; onDone: () => void }) {
  const { colors } = useTheme();
  const [name, setName] = useState(me.fullName);
  const [career, setCareer] = useState(me.career ?? '');
  const [semester, setSemester] = useState(me.semester ?? 1);
  const [interests, setInterests] = useState<string[]>(me.interests);
  const [photo, setPhoto] = useState<string | null>(me.photo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = name.trim().length >= 2 && interests.length >= 3;

  async function choosePhoto() {
    try {
      const f = await pickPhoto({ square: true });
      if (!f) return;
      setBusy(true);
      setPhoto(await uploadPhoto(me.id, f));
    } catch (e) {
      Alert.alert('No pudimos subir la foto', friendlyError(e, (e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.updateProfile(me.id, {
        full_name: name.trim(),
        career: career.trim() || null,
        semester,
        interests,
        photo_path: photo,
      });
      onDone();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  const toggle = (label: string) => setInterests((cur) => (cur.includes(label) ? cur.filter((x) => x !== label) : cur.length >= 11 ? cur : [...cur, label]));

  return (
    <>
      <Row gap={14} style={{ alignItems: 'flex-start' }}>
        <Pressable onPress={choosePhoto} accessibilityRole="button" accessibilityLabel={photo ? 'Cambiar foto de perfil' : 'Agregar foto de perfil'}>
          {photo ? (
            <Avatar name={name || 'Tú'} photoUrl={mediaUrl(photo)} dim="lg" raised />
          ) : (
            <View style={{ width: 76, height: 76, borderRadius: 999, borderWidth: 2, borderColor: colors.border, backgroundColor: fills.peach, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="add_a_photo" size={32} color={fills.onFill} />
            </View>
          )}
        </Pressable>
        <View style={{ flex: 1, gap: 8 }}>
          <Field placeholder="Nombre" value={name} onChangeText={setName} autoComplete="name" textContentType="name" maxLength={60} accessibilityLabel="Nombre" />
          <Field placeholder="Carrera" value={career} onChangeText={setCareer} maxLength={60} accessibilityLabel="Carrera" />
        </View>
      </Row>
      <Stepper label="Semestre" value={semester} min={1} max={14} onChange={setSemester} />
      <Row justify="space-between">
        <Text variant="label">Tus intereses</Text>
        <Text variant="label">{interests.length} elegidos · mín. 3</Text>
      </Row>
      <Row wrap gap={8}>
        {INTERESTS.map((label) => (
          <Chip key={label} label={label} selected={interests.includes(label)} onPress={() => toggle(label)} />
        ))}
      </Row>
      {error ? (
        <Text variant="small" tone="danger">
          {error}
        </Text>
      ) : null}
      <Spacer />
      <Button label={submitLabel} iconRight="arrow_forward" onPress={save} loading={busy} disabled={!ready} />
    </>
  );
}
