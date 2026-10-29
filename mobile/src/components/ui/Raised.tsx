import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, hardShadow, type Elevation } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type Props = Omit<PressableProps, 'style'> & {
  elevation?: Elevation;
  /** Color de borde y sombra fijos (tarjetas protagonistas con relleno pastel usan #16141d). */
  ink?: string;
  bg?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Superficie con contorno de 2 px y sombra dura. Si recibe onPress se comporta como botón:
 * al presionar se hunde 2 px y la sombra baja a 1 px (DESIGN.md · elevation.pressed).
 */
export function Raised({ elevation = 'lg', ink, bg, radius = 20, style, children, onPress, disabled, ...rest }: Props) {
  const { colors } = useTheme();
  const borderColor = ink ?? colors.border;
  const shadowColor = ink ?? colors.shadow;
  const base: ViewStyle = {
    backgroundColor: bg ?? colors.card,
    borderColor,
    borderWidth,
    borderRadius: radius,
  };

  if (!onPress) {
    return (
      <View style={[base, { boxShadow: hardShadow(elevation, shadowColor) }, style]} {...(rest as object)}>
        {children as React.ReactNode}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      {...rest}
      style={({ pressed }) => [
        base,
        {
          boxShadow: hardShadow(pressed ? 'pressed' : elevation, shadowColor),
          transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : undefined,
        },
        disabled && { opacity: 0.35 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
