import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Banner, Button, Card, Header, Icon, Screen, Skeleton, Spacer, Stars, StateBlock, Text } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { errorCode, friendlyError } from '@/lib/errors';
import { mediaUrl } from '@/lib/supabase';
import { usePlan, usePlanId, useRefreshPlans } from '@/lib/usePlan';
import { borderWidth, fills } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export default function Rate() {
  const id = usePlanId();
  const { colors } = useTheme();
  const { me } = useAuth();
  const plan = usePlan(id);
  const refresh = useRefreshPlans();
  const [stars, setStars] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const p = plan.data;
  if (!p) return <Screen><Header backIcon="close" /><Skeleton height={300} /></Screen>;

  if (p.rated) {
    return (
      <Screen center>
        <StateBlock icon="star" fill="peach" title="Ya calificaste este plan" body="Tu calificación se publica cuando todos califiquen, o en 3 días." primary={{ label: 'Ver más planes', onPress: () => router.replace('/events/feed') }} secondary={{ label: 'Volver al inicio', onPress: () => router.replace('/home') }} />
      </Screen>
    );
  }

  const others = p.attendees.filter((a) => a.id !== me?.id);
  const toggle = (uid: string) => setLiked((l) => (l.includes(uid) ? l.filter((x) => x !== uid) : [...l, uid]));

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api.rate(id, stars, liked);
      await refresh(id);
      router.replace('/events/feed');
    } catch (e) {
      setError(errorCode(e) === 'NOT_FINISHED' ? 'Podrás calificar cuando el plan empiece.' : friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Header backIcon="close" backLabel="Cerrar" onBack={() => router.replace('/home')} />
      <Text variant="h1">¿Cómo te fue?</Text>
      <Text tone="muted" style={{ marginTop: -8 }}>
        Tu calificación ayuda a que los planes sean mejores.
      </Text>
      <Card style={{ alignItems: 'center' }}>
        <Text variant="label">{p.title}</Text>
        <Stars value={stars} onChange={setStars} label="Calificación del plan" />
      </Card>
      {others.length ? (
        <>
          <Text variant="label">Los asistentes · ¿con quién te gustó compartir?</Text>
          {others.map((a) => {
            const on = liked.includes(a.id);
            return (
              <Card key={a.id} row compact>
                <Avatar name={a.name} photoUrl={mediaUrl(a.photo)} />
                <Text variant="title" style={{ flex: 1 }}>
                  {a.name}
                </Text>
                <Pressable
                  onPress={() => toggle(a.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`Me gustó compartir con ${a.name}`}
                  hitSlop={6}
                  style={{ width: 48, height: 40, borderRadius: 999, borderWidth, borderColor: colors.border, backgroundColor: on ? fills.lilac : 'transparent', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="thumb_up" size="sm" color={on ? fills.onFill : colors.foreground} />
                </Pressable>
              </Card>
            );
          })}
        </>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
        <Icon name="visibility" color={colors.mutedForeground} />
        <Text variant="small" tone="muted" style={{ flex: 1 }}>
          Tus calificaciones se publican cuando todos califiquen, o en 3 días. Nadie ve la suya antes.
        </Text>
      </View>
      {error ? <Banner icon="error" fill="coral" title="No se pudo enviar" body={error} /> : null}
      <Spacer />
      <Button label="Enviar y ver más planes" onPress={submit} loading={busy} disabled={stars === 0} />
    </Screen>
  );
}
