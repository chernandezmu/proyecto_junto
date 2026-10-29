import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { FadeIn, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { categoryOf, PlanMedia, PlanStatusTag } from '@/components/plan';
import { Card, Chip, ErrorCard, Header, Icon, IconButton, Raised, Row, Screen, Sheet, Skeleton, StateBlock, Text, ToggleRow } from '@/components/ui';
import { api, type PlanCard } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useModuleInterest } from '@/lib/useModuleInterest';
import { when } from '@/lib/format';
import { categories, categoryKeys, fills, radius, type CategoryKey } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

const THRESHOLD = 110;

export default function Feed() {
  const { me } = useAuth();
  const [category, setCategoryState] = useState<CategoryKey | null>(null);
  const [filters, setFilters] = useState(false);
  const [index, setIndex] = useState(0);
  const feed = useQuery({ queryKey: ['feed', category], queryFn: () => api.feed(category) });
  const notify = useModuleInterest('feed');

  const plans = feed.data ?? [];
  const current = plans[index];
  const next = plans[index + 1];
  const approved = me?.verification === 'approved';

  const setCategory = (c: CategoryKey | null) => {
    setCategoryState(c);
    setIndex(0);
  };
  const pass = () => setIndex((i) => i + 1);
  const interested = (p: PlanCard) => router.push(`/plan/${p.id}/join`);

  return (
    <Screen scroll={false} animate={false}>
      <Header
        center={<Text variant="title">Hoy en el campus</Text>}
        right={<IconButton icon="tune" label={category ? `Filtro: ${categories[category].label}` : 'Filtrar por categoría'} onPress={() => setFilters(true)} bg={category ? fills.lilac : undefined} color={category ? fills.onFill : undefined} />}
      />

      {feed.isLoading ? (
        <Skeleton height={440} />
      ) : feed.isError ? (
        <ErrorCard onRetry={feed.refetch} />
      ) : !plans.length ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <StateBlock
            icon="event_available"
            fill="lilac"
            title={category ? `No hay planes de ${categories[category].label.toLowerCase()}` : 'Todavía no hay planes hoy'}
            body="Sé la primera persona en armar uno: los planes nuevos le aparecen a todo tu campus."
            primary={approved ? { label: 'Crear un plan', icon: 'add', onPress: () => router.push('/events/create') } : undefined}
            secondary={category ? { label: 'Ver todas las categorías', onPress: () => setCategory(null) } : undefined}
            extra={<Card><ToggleRow icon="notifications_active" label="Avisarme cuando haya" value={notify.on} onChange={notify.set} /></Card>}
          />
        </View>
      ) : !current ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <StateBlock
            icon="done_all"
            fill="mint"
            title="Viste todos los planes de hoy"
            body="Vuelve más tarde o arma el tuyo."
            primary={approved ? { label: 'Crear un plan', icon: 'add', onPress: () => router.push('/events/create') } : undefined}
            secondary={{ label: 'Ver de nuevo', icon: 'refresh', onPress: () => { setIndex(0); feed.refetch(); } }}
          />
        </View>
      ) : (
        <>
          <View style={{ flex: 1, minHeight: 380 }}>
            {next ? <BackCard key={`back-${next.id}`} /> : null}
            <SwipeCard key={current.id} plan={current} position={`${index + 1} de ${plans.length}`} onPass={pass} onInterested={() => interested(current)} />
          </View>
          <Row justify="center" gap={22}>
            <IconButton icon="close" label="Pasar al siguiente plan" large onPress={pass} />
            <IconButton icon="check" label="Me interesa este plan" large bg={fills.mint} color={fills.onFill} onPress={() => interested(current)} />
          </Row>
          <Text variant="small" tone="muted" center>
            {index + 1} de {plans.length} planes · toca la tarjeta para ver detalles
          </Text>
        </>
      )}

      <Sheet visible={filters} onClose={() => setFilters(false)} title="¿Qué te provoca?">
        <Row wrap gap={8}>
          <Chip label="Todos" selected={!category} onPress={() => { setCategory(null); setFilters(false); }} />
          {categoryKeys.map((k) => (
            <Chip key={k} label={categories[k].label} icon={categories[k].icon} selected={category === k} onPress={() => { setCategory(k); setFilters(false); }} />
          ))}
        </Row>
      </Sheet>
    </Screen>
  );
}

function BackCard() {
  const { colors } = useTheme();
  return (
    <Animated.View
      entering={FadeIn}
      style={{ position: 'absolute', top: 14, left: 14, right: -6, bottom: -6, opacity: 0.5, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card }}
    />
  );
}

function SwipeCard({ plan, position, onPass, onInterested }: { plan: PlanCard; position: string; onPass: () => void; onInterested: () => void }) {
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const x = useSharedValue(reduced ? 0 : width * 0.7);
  const opacity = useSharedValue(reduced ? 0 : 1);
  const c = categoryOf(plan.category);

  // La tarjeta entra desde la derecha rotada (o con fundido si hay movimiento reducido).
  useEffect(() => {
    if (reduced) opacity.set(withTiming(1, { duration: 150 }));
    else x.set(withSpring(0, { damping: 16, stiffness: 140 }));
  }, [reduced, x, opacity]);

  const fling = (dir: 1 | -1) => {
    'worklet';
    const done = dir > 0 ? onInterested : onPass;
    if (reduced) {
      opacity.set(withTiming(0, { duration: 150 }, () => scheduleOnRN(done)));
    } else {
      x.set(withTiming(dir * width * 1.3, { duration: 250 }, () => scheduleOnRN(done)));
    }
  };

  const pan = usePanGesture({
    activeOffsetX: [-12, 12],
    onUpdate: (e) => {
      'worklet';
      x.set(e.translationX);
    },
    onDeactivate: (e) => {
      'worklet';
      if (e.translationX > THRESHOLD || e.velocityX > 900) fling(1);
      else if (e.translationX < -THRESHOLD || e.velocityX < -900) fling(-1);
      else x.set(withSpring(0, { damping: 15 }));
    },
  });

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateX: x.get() }, { rotate: `${interpolate(x.get(), [-width, 0, width], [-14, 0, 14])}deg` }],
  }));
  // Pistas visuales de la dirección del gesto.
  const passHint = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [-THRESHOLD, -20], [1, 0], 'clamp') }));
  const likeHint = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [20, THRESHOLD], [0, 1], 'clamp') }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ position: 'absolute', inset: 0 }, style]}>
        <Raised
          onPress={() => router.push(`/plan/${plan.id}`)}
          radius={radius.lg}
          accessibilityLabel={`Plan ${position}: ${plan.title}, ${when(plan.startsAt)}, ${plan.place}. ${plan.capacity - plan.joined} cupos.`}
          accessibilityHint="Toca para ver detalles. Desliza a la derecha si te interesa o a la izquierda para pasar."
          accessibilityActions={[{ name: 'interested', label: 'Me interesa' }, { name: 'pass', label: 'Pasar' }]}
          onAccessibilityAction={(e) => (e.nativeEvent.actionName === 'interested' ? onInterested() : onPass())}
          style={{ flex: 1, padding: 12, gap: 12 }}
        >
          <PlanMedia plan={plan} flex />
          <View style={{ paddingHorizontal: 4, gap: 8 }}>
            <Row justify="space-between">
              <Text variant="label">{when(plan.startsAt)}</Text>
              <PlanStatusTag plan={plan} />
            </Row>
            <Text variant="h2" numberOfLines={2}>
              {plan.title}
            </Text>
            <Row gap={6}>
              <Icon name="location_on" size="sm" color={undefined} />
              <Text variant="small" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
                {plan.place} · {c.label}
              </Text>
            </Row>
          </View>
          <Animated.View style={[{ position: 'absolute', top: 24, right: 24, transform: [{ rotate: '12deg' }] }, passHint]} pointerEvents="none">
            <HintStamp label="PASO" fill="coral" />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', top: 24, left: 24, transform: [{ rotate: '-12deg' }] }, likeHint]} pointerEvents="none">
            <HintStamp label="ME INTERESA" fill="mint" />
          </Animated.View>
        </Raised>
      </Animated.View>
    </GestureDetector>
  );
}

function HintStamp({ label, fill }: { label: string; fill: 'coral' | 'mint' }) {
  return (
    <View style={{ backgroundColor: fills[fill], borderWidth: 2, borderColor: fills.onFill, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 20 }} tone="onFill">
        {label}
      </Text>
    </View>
  );
}

