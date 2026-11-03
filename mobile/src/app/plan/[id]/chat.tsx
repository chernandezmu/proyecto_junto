import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Alert, Pressable, ScrollView, TextInput } from 'react-native';
import Animated, { FadeInLeft, FadeInRight, useReducedMotion } from 'react-native-reanimated';

import { Button, Card, Chip, ErrorCard, Header, Icon, IconButton, Row, Screen, Skeleton, Text } from '@/components/ui';
import { api, type Message } from '@/lib/api';
import { friendlyError } from '@/lib/errors';
import { time } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { useNow } from '@/lib/useNow';
import { usePlan, usePlanId, useRefreshPlans } from '@/lib/usePlan';
import { borderWidth, fills, fonts } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

const QUICK = ['Voy en camino', '¿Llevo algo?', 'Voy tarde'];

export default function Chat() {
  const id = usePlanId();
  const { colors } = useTheme();
  const qc = useQueryClient();
  const plan = usePlan(id);
  const refresh = useRefreshPlans();
  const messages = useQuery({ queryKey: ['messages', id], queryFn: () => api.messages(id) });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = useNow();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  // Mensajes nuevos en tiempo real (la política RLS solo los entrega a miembros del plan).
  useEffect(() => {
    const channel = supabase
      .channel(`plan-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `plan_id=eq.${id}` }, () => {
        qc.invalidateQueries({ queryKey: ['messages', id] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, qc]);

  async function send(text: string) {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      await api.send(id, body);
      setDraft('');
      await qc.invalidateQueries({ queryKey: ['messages', id] });
    } catch (e) {
      setError(friendlyError(e, 'No se pudo enviar el mensaje. Tu texto sigue aquí.'));
    } finally {
      setSending(false);
    }
  }

  function moreOptions(m: Message) {
    if (m.mine || !m.author) return;
    const author = m.author;
    Alert.alert(author.name, undefined, [
      { text: 'Reportar mensaje', onPress: () => router.push({ pathname: '/report', params: { type: 'message', id: String(m.id), name: author.name } }) },
      {
        text: `Bloquear a ${author.name}`,
        style: 'destructive',
        onPress: async () => {
          await api.block(author.id).catch(() => {});
          qc.invalidateQueries({ queryKey: ['messages', id] });
          refresh(id);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  const p = plan.data;
  const startsIn = p ? new Date(p.startsAt).getTime() - now : Infinity;
  const showGo = p && p.status === 'published' && startsIn < 2 * 3_600_000;

  return (
    <Screen scroll={false} animate={false} contentStyle={{ gap: 12 }}>
      <Header
        center={
          <Pressable onPress={() => router.push(`/plan/${id}`)} accessibilityRole="button" accessibilityHint="Abre los detalles del plan" style={{ alignItems: 'center' }}>
            <Row gap={4}>
              <Text variant="title" numberOfLines={1} style={{ maxWidth: 220 }}>
                {p?.title ?? 'Chat del plan'}
              </Text>
              <Icon name="expand_more" size="sm" />
            </Row>
            <Text variant="small" tone="muted">
              {p ? `${p.joined + 1} personas · toca para ver detalles` : ' '}
            </Text>
          </Pressable>
        }
      />
      {p?.pinned ? (
        <Card fill="lime" row compact>
          <Icon name="push_pin" color={fills.onFill} label="Mensaje fijado" />
          <Text variant="small" tone="onFill" style={{ flex: 1 }}>
            {p.pinned}
          </Text>
        </Card>
      ) : null}

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ gap: 12, paddingVertical: 4 }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        {messages.isLoading ? (
          <>
            <Skeleton height={56} />
            <Skeleton height={56} />
          </>
        ) : messages.isError ? (
          <ErrorCard onRetry={messages.refetch} />
        ) : messages.data?.length ? (
          messages.data.map((m) => <Bubble key={m.id} m={m} onLongPress={() => moreOptions(m)} />)
        ) : (
          <SystemLine text="Eres de los primeros. Saluda y rompe el hielo 👋" />
        )}
      </ScrollView>

      {error ? (
        <Text variant="small" tone="danger">
          {error}
        </Text>
      ) : null}
      <Row wrap gap={6}>
        {QUICK.map((q) => (
          <Chip key={q} label={q} onPress={() => send(q === 'Voy tarde' ? 'Voy un poco tarde.' : q)} />
        ))}
      </Row>
      <Row gap={8}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Escribe un mensaje…"
          placeholderTextColor={colors.mutedForeground}
          accessibilityLabel="Mensaje"
          multiline
          maxLength={1000}
          style={{
            flex: 1,
            minHeight: 52,
            maxHeight: 120,
            borderWidth,
            borderColor: colors.border,
            borderRadius: 26,
            backgroundColor: colors.card,
            color: colors.foreground,
            paddingHorizontal: 18,
            paddingVertical: 14,
            fontFamily: fonts.regular,
            fontSize: 16,
          }}
        />
        <IconButton icon="send" label="Enviar mensaje" onPress={() => send(draft)} bg={fills.lilac} color={fills.onFill} disabled={!draft.trim() || sending} />
      </Row>
      {showGo ? <Button label={p.isOrganizer ? 'Validar asistencia' : 'Ir al evento'} icon="where_to_vote" onPress={() => router.push(p.isOrganizer ? `/plan/${id}/check-in` : `/plan/${id}/today`)} /> : null}
    </Screen>
  );
}

function SystemLine({ text }: { text: string }) {
  return (
    <Text variant="small" tone="muted" center style={{ paddingHorizontal: 24 }}>
      {text}
    </Text>
  );
}

function Bubble({ m, onLongPress }: { m: Message; onLongPress: () => void }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  if (m.kind === 'system') return <SystemLine text={m.body} />;
  const mine = !!m.mine;
  return (
    <Animated.View entering={reduced ? undefined : mine ? FadeInRight.springify().damping(16) : FadeInLeft.springify().damping(16)} style={{ gap: 4, alignItems: mine ? 'flex-end' : 'flex-start' }}>
      <Text variant="label" style={{ fontSize: 12 }}>
        {mine ? 'Tú' : (m.author?.name ?? 'Alguien')} · {time(m.createdAt)}
      </Text>
      <Pressable
        onLongPress={onLongPress}
        accessibilityHint={mine ? undefined : 'Mantén pulsado para reportar o bloquear'}
        accessibilityActions={mine ? undefined : [{ name: 'longpress', label: 'Reportar o bloquear' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'longpress') onLongPress();
        }}
        style={{
          maxWidth: '82%',
          borderWidth,
          borderColor: colors.border,
          backgroundColor: mine ? fills.lilac : colors.card,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderBottomLeftRadius: mine ? 18 : 4,
          borderBottomRightRadius: mine ? 4 : 18,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text tone={mine ? 'onFill' : 'default'}>{m.body}</Text>
      </Pressable>
    </Animated.View>
  );
}
