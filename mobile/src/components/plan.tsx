import { Image } from 'expo-image';
import { View } from 'react-native';

import { Card, Icon, IconTile, Tag, Text, type IconName } from '@/components/ui';
import type { PlanCard } from '@/lib/api';
import { seatsLabel, when } from '@/lib/format';
import { mediaUrl } from '@/lib/supabase';
import { borderWidth, categories, fills, radius, type CategoryKey, type FillName } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export function categoryOf(key: string): { label: string; fill: FillName; icon: IconName } {
  const c = categories[key as CategoryKey];
  return c ? { label: c.label, fill: c.fill, icon: c.icon } : { label: 'Plan', fill: 'lilac', icon: 'celebration' };
}

/** Foto del plan, o relleno de su categoría con el icono grande. */
export function PlanMedia({ plan, height, flex }: { plan: Pick<PlanCard, 'photo' | 'category' | 'title'>; height?: number; flex?: boolean }) {
  const { colors } = useTheme();
  const c = categoryOf(plan.category);
  const url = mediaUrl(plan.photo);
  return (
    <View
      style={{
        height,
        flex: flex ? 1 : undefined,
        minHeight: 120,
        borderRadius: radius.md,
        borderWidth,
        borderColor: colors.border,
        backgroundColor: fills[c.fill],
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {url ? (
        <Image source={{ uri: url }} style={{ position: 'absolute', inset: 0 }} contentFit="cover" accessibilityLabel={`Foto de ${plan.title}`} transition={150} />
      ) : (
        <Icon name={c.icon} size={56} color={fills.onFill} />
      )}
    </View>
  );
}

/** Etiqueta de estado del plan (cupos, lleno, cancelado, pendiente…). */
export function PlanStatusTag({ plan }: { plan: PlanCard }) {
  if (plan.status === 'cancelled') return <Tag label="Cancelado" fill="coral" />;
  if (plan.status === 'finished') return <Tag label="Terminado" soon />;
  if (plan.myStatus === 'pending') return <Tag label="Pendiente" fill="peach" />;
  if (plan.isOrganizer) return <Tag label="Organizas" fill="lilac" />;
  if (plan.myStatus === 'joined') return <Tag label="Inscrito" fill="mint" />;
  const left = plan.capacity - plan.joined;
  return <Tag label={seatsLabel(plan.capacity, plan.joined)} fill={left <= 0 ? 'coral' : 'mint'} />;
}

/** Fila de plan para listas (Hoy en tu campus, Mis planes). */
export function PlanRow({ plan, onPress }: { plan: PlanCard; onPress: () => void }) {
  const c = categoryOf(plan.category);
  return (
    <Card row compact onPress={onPress} label={`${plan.title}, ${when(plan.startsAt)}, ${plan.place}`} hint="Abre el plan">
      <IconTile icon={c.icon} fill={c.fill} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="label">{when(plan.startsAt)}</Text>
        <Text variant="title" numberOfLines={2}>
          {plan.title}
        </Text>
      </View>
      <PlanStatusTag plan={plan} />
    </Card>
  );
}
