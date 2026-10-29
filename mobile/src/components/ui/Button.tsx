import { ActivityIndicator, Pressable, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Raised } from './Raised';
import { Text } from './Text';
import { fills, size } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type Variant = 'primary' | 'accent' | 'success' | 'danger' | 'secondary';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  large?: boolean;
  /** Texto en color de peligro sobre botón secundario (Eliminar cuenta, Cerrar sesión). */
  danger?: boolean;
  hint?: string;
  flex?: boolean;
};

export function Button({ label, onPress, variant = 'primary', icon, iconRight, disabled, loading, large, danger, hint, flex }: Props) {
  const { colors } = useTheme();
  const bg = {
    primary: colors.primary,
    accent: fills.lime,
    success: fills.mint,
    danger: fills.coral,
    secondary: colors.card,
  }[variant];
  const fg =
    variant === 'primary'
      ? colors.primaryForeground
      : variant === 'secondary'
        ? danger
          ? colors.destructiveText
          : colors.foreground
        : fills.onFill;
  const height = variant === 'secondary' ? size.buttonSecondary : large ? size.buttonLg : size.button;

  return (
    <Raised
      onPress={loading ? undefined : onPress}
      disabled={disabled}
      elevation="md"
      bg={bg}
      radius={999}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[{ minHeight: height, paddingHorizontal: 18, justifyContent: 'center' }, flex && { flex: 1 }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} color={fg} /> : null}
        <Text variant={large ? 'buttonLg' : 'button'} color={fg} center>
          {label}
        </Text>
        {iconRight && !loading ? <Icon name={iconRight} color={fg} /> : null}
      </View>
    </Raised>
  );
}

/** Enlace subrayado de 14 pt con área táctil ≥ 44. */
export function LinkButton({ label, onPress, center = true }: { label: string; onPress?: () => void; center?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => ({ minHeight: 44, justifyContent: 'center', opacity: pressed ? 0.6 : 1, alignSelf: center ? 'center' : 'flex-start' })}
    >
      <Text variant="small" tone="muted" style={{ textDecorationLine: 'underline' }}>
        {label}
      </Text>
    </Pressable>
  );
}

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  large?: boolean;
  bg?: string;
  color?: string;
  disabled?: boolean;
};

/** Botón de icono redondo (44 o 64). Siempre con accessibilityLabel. */
export function IconButton({ icon, label, onPress, large, bg, color, disabled }: IconButtonProps) {
  const dim = large ? size.iconButtonLg : size.iconButton;
  return (
    <Raised
      onPress={onPress}
      disabled={disabled}
      elevation={large ? 'md' : 'sm'}
      bg={bg}
      radius={999}
      accessibilityLabel={label}
      hitSlop={4}
      style={{ width: dim, height: dim, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={icon} size={large ? 32 : 'md'} color={color} />
    </Raised>
  );
}
