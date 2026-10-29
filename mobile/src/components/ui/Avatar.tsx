import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { Text } from './Text';
import { borderWidth, fills, fonts, hardShadow, size, type FillName } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

const order: FillName[] = ['peach', 'lilac', 'sky', 'mint', 'lime'];

/** Color estable por nombre, para que cada persona tenga siempre el mismo. */
export function fillFor(seed: string): FillName {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return order[h % order.length];
}

type Props = {
  name: string;
  photoUrl?: string | null;
  dim?: keyof typeof size.avatar | number;
  fill?: FillName;
  onPress?: () => void;
  raised?: boolean;
  overlap?: boolean;
  label?: string;
};

export function Avatar({ name, photoUrl, dim = 'md', fill, onPress, raised, overlap, label }: Props) {
  const { colors } = useTheme();
  const px = typeof dim === 'number' ? dim : size.avatar[dim];
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const body = (
    <View
      style={{
        width: px,
        height: px,
        borderRadius: 999,
        borderWidth,
        borderColor: colors.border,
        backgroundColor: fills[fill ?? fillFor(name)],
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginLeft: overlap ? -8 : 0,
        boxShadow: raised ? hardShadow('md', colors.shadow) : undefined,
      }}
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" accessibilityIgnoresInvertColors />
      ) : (
        <Text style={{ fontFamily: fonts.display, fontSize: Math.round(px * 0.38), lineHeight: Math.round(px * 0.46) }} color={fills.onFill}>
          {initial}
        </Text>
      )}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label ?? 'Perfil'} hitSlop={4}>
      {body}
    </Pressable>
  );
}

/** Avatares apilados con "+N" (Quién va). */
export function AvatarStack({ people, total, max = 4 }: { people: { name: string; photoUrl?: string | null }[]; total?: number; max?: number }) {
  const shown = people.slice(0, max);
  const rest = (total ?? people.length) - shown.length;
  return (
    <View
      style={{ flexDirection: 'row', paddingLeft: 8 }}
      accessible
      accessibilityLabel={`${total ?? people.length} ${(total ?? people.length) === 1 ? 'persona va' : 'personas van'}`}
    >
      {shown.map((p, i) => (
        <Avatar key={`${p.name}-${i}`} name={p.name} photoUrl={p.photoUrl} dim="sm" overlap />
      ))}
      {rest > 0 ? <Avatar name={`+${rest}`} dim="sm" overlap fill="mint" /> : null}
    </View>
  );
}
