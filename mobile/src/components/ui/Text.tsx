import { Text as RNText, type TextProps } from 'react-native';

import { maxScale, type, type TypeVariant } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type Tone = 'default' | 'muted' | 'onFill' | 'inverse' | 'danger';

export type AppTextProps = TextProps & {
  variant?: TypeVariant;
  tone?: Tone;
  color?: string;
  center?: boolean;
  tabular?: boolean;
};

export function Text({ variant = 'body', tone = 'default', color, center, tabular, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const toneColor = {
    default: colors.foreground,
    muted: colors.mutedForeground,
    onFill: '#16141d',
    inverse: colors.primaryForeground,
    danger: colors.destructiveText,
  }[tone];
  const isHeading = variant === 'display' || variant === 'h1' || variant === 'h1Sm' || variant === 'h2';
  return (
    <RNText
      accessibilityRole={isHeading ? 'header' : undefined}
      maxFontSizeMultiplier={maxScale[variant] ?? 2}
      {...rest}
      style={[
        type[variant],
        // Las etiquetas en mayúsculas usan muted por defecto (DESIGN.md · label).
        { color: color ?? (variant === 'label' && tone === 'default' ? colors.mutedForeground : toneColor) },
        center && { textAlign: 'center' },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}
