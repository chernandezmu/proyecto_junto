import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Raised } from './Raised';
import { Text } from './Text';
import { fills, layout, radius, size, type FillName } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type CardProps = {
  children: React.ReactNode;
  fill?: FillName;
  /** Tarjeta protagonista: borde y sombra #16141d sobre relleno pastel. */
  hero?: boolean;
  row?: boolean;
  compact?: boolean;
  onPress?: () => void;
  label?: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, fill, hero, row, compact, onPress, label, hint, style }: CardProps) {
  return (
    <Raised
      onPress={onPress}
      bg={fill ? fills[fill] : undefined}
      ink={hero ? fills.onFill : undefined}
      radius={radius.lg}
      elevation="lg"
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={[
        {
          padding: compact ? 12 : layout.cardPadding,
          gap: layout.cardGap,
          flexDirection: row ? 'row' : 'column',
          alignItems: row ? 'center' : 'stretch',
        },
        style,
      ]}
    >
      {children}
    </Raised>
  );
}

/** Baldosa redonda con icono sobre relleno (módulos, categorías, listas). */
export function IconTile({ icon, fill, muted, dim = size.iconTile }: { icon: IconName; fill?: FillName; muted?: boolean; dim?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: dim,
        height: dim,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: muted ? colors.muted : fill ? fills[fill] : colors.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} color={muted ? colors.mutedForeground : fill ? fills.onFill : colors.foreground} />
    </View>
  );
}

/** Fila de lista dentro de una tarjeta: icono + título/subtítulo + accesorio. */
export function ListRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  tone,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  tone?: 'danger';
}) {
  const { colors } = useTheme();
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 }}>
      {icon ? <Icon name={icon} color={tone === 'danger' ? colors.destructiveText : undefined} /> : null}
      <View style={{ flex: 1 }}>
        <Text variant="title" tone={tone === 'danger' ? 'danger' : 'default'}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="small" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron_right" /> : null)}
    </View>
  );
  if (!onPress) return content;
  return (
    <Raised onPress={onPress} elevation="none" bg="transparent" ink="transparent" radius={12} accessibilityLabel={title}>
      {content}
    </Raised>
  );
}
