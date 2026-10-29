import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { PlanMedia } from '@/components/plan';
import { Banner, Button, Card, Chip, Field, Header, Icon, Row, Screen, Segmented, Stepper, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { friendlyError } from '@/lib/errors';
import { day, time } from '@/lib/format';
import { pickPhoto, uploadPhoto } from '@/lib/media';
import { useNow } from '@/lib/useNow';
import { useRefreshPlans } from '@/lib/usePlan';
import { borderWidth, categories, categoryKeys, radius, type CategoryKey } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type Errors = Partial<Record<'title' | 'category' | 'date' | 'time' | 'place', string>>;

export default function CreatePlan() {
  const { colors } = useTheme();
  const { me } = useAuth();
  const refresh = useRefreshPlans();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [clock, setClock] = useState<Date | null>(null);
  const [place, setPlace] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [cancelHours, setCancelHours] = useState<'1' | '3' | '24'>('3');
  const [access, setAccess] = useState<'open' | 'approval'>('open');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const now = useNow(60_000);

  if (!me) return null;

  const startsAt = date && clock ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), clock.getHours(), clock.getMinutes()) : null;
  const maxDate = new Date(now + 60 * 86_400_000);

  function validate(): Errors {
    const e: Errors = {};
    if (title.trim().length < 3) e.title = 'Escribe qué van a hacer (mínimo 3 letras).';
    if (!category) e.category = 'Elige una categoría.';
    if (!date) e.date = 'Elige la fecha.';
    if (!clock) e.time = 'Elige la hora.';
    else if (startsAt && startsAt.getTime() < now + 15 * 60_000) e.time = 'Elige una hora desde 15 minutos a partir de ahora.';
    if (place.trim().length < 2) e.place = 'Escribe el lugar (por ejemplo, "Bloque C · salón 204").';
    return e;
  }

  async function addPhoto() {
    try {
      const f = await pickPhoto();
      if (!f || !me) return;
      setBusy(true);
      setPhoto(await uploadPhoto(me.id, f));
    } catch (e) {
      Alert.alert('No pudimos subir la foto', friendlyError(e, (e as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length || !startsAt || !category) return;
    setBusy(true);
    setServerError(null);
    try {
      const id = await api.createPlan({
        title: title.trim(),
        category,
        startsAt,
        place: place.trim(),
        capacity,
        cancelHours: Number(cancelHours) as 1 | 3 | 24,
        access,
        description: description.trim() || undefined,
        photoPath: photo,
      });
      await refresh();
      router.replace(`/plan/${id}/manage`);
    } catch (err) {
      setServerError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  const missing = Object.keys(errors).length > 0;

  return (
    <Screen>
      <Header center={<Text variant="title">Crear plan</Text>} />
      <Field label="¿Qué van a hacer?" placeholder="Ej. Parche de estudio + pizza" value={title} onChangeText={setTitle} maxLength={60} error={errors.title} />

      <View style={{ gap: 8 }}>
        <Text variant="label">Categoría</Text>
        <Row wrap gap={8}>
          {categoryKeys.map((k) => (
            <Chip key={k} label={categories[k].label} icon={categories[k].icon} selected={category === k} onPress={() => setCategory(k)} />
          ))}
        </Row>
        {errors.category ? (
          <Text variant="small" tone="danger">
            {errors.category}
          </Text>
        ) : null}
      </View>

      <Row gap={10} style={{ alignItems: 'flex-start' }}>
        <DateField label="Fecha" value={date} onChange={setDate} placeholder="Elegir" format={day} minimumDate={new Date(now)} maximumDate={maxDate} error={errors.date} />
        <DateField label="Hora" mode="time" value={clock} onChange={setClock} placeholder="Elegir" format={time} error={errors.time} />
      </Row>

      <Field label="Lugar" placeholder="Bloque C · salón 204" value={place} onChangeText={setPlace} maxLength={80} error={errors.place} />

      <Card>
        <Stepper label="Cupos" value={capacity} min={2} max={50} onChange={setCapacity} />
      </Card>

      <View style={{ gap: 8 }}>
        <Text variant="label">Cancelación gratis hasta</Text>
        <Segmented
          label="Cancelación gratis hasta"
          value={cancelHours}
          onChange={setCancelHours}
          options={[
            { value: '1', label: '1 h antes' },
            { value: '3', label: '3 h antes' },
            { value: '24', label: '24 h antes' },
          ]}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text variant="label">Quién puede unirse</Text>
        <Segmented
          label="Quién puede unirse"
          value={access}
          onChange={setAccess}
          options={[
            { value: 'open', label: 'Todo mi campus' },
            { value: 'approval', label: 'Apruebo yo' },
          ]}
        />
      </View>

      <Field label="Descripción (opcional)" placeholder="Cuéntale a la gente qué esperar" value={description} onChangeText={setDescription} maxLength={500} multiline />

      {photo ? (
        <View style={{ gap: 8 }}>
          <PlanMedia plan={{ photo, category: category ?? 'estudio', title: title || 'Tu plan' }} height={160} />
          <Button label="Quitar foto" variant="secondary" onPress={() => setPhoto(null)} />
        </View>
      ) : (
        <Pressable
          onPress={addPhoto}
          accessibilityRole="button"
          accessibilityLabel="Agregar una foto del plan (opcional)"
          style={{ minHeight: 64, borderRadius: radius.md, borderWidth, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
        >
          <Icon name="image" />
          <Text>Agregar foto (opcional)</Text>
        </Pressable>
      )}

      {missing ? <Banner icon="error" fill="coral" title="Revisa los campos marcados" body="Te falta información para publicar el plan." /> : null}
      {serverError ? <Banner icon="error" fill="coral" title="No se pudo publicar" body={serverError} /> : null}
      <Button label="Publicar plan" onPress={publish} loading={busy} />
    </Screen>
  );
}
