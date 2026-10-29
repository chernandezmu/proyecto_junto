import Svg, { Path } from 'react-native-svg';

import { ICONS, type IconName } from '../icons.generated';
import { size as sizes } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

export type { IconName };

type Props = {
  name: IconName;
  size?: number | keyof typeof sizes.icon;
  color?: string;
  /** Si el icono transmite información sin texto al lado, dale una etiqueta. Si no, queda oculto al lector. */
  label?: string;
};

export function Icon({ name, size = 'md', color, label }: Props) {
  const { colors } = useTheme();
  const px = typeof size === 'number' ? size : sizes.icon[size];
  const hidden = !label;
  return (
    <Svg
      width={px}
      height={px}
      viewBox="0 -960 960 960"
      fill={color ?? colors.foreground}
      accessible={!hidden}
      accessibilityLabel={label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'yes'}
    >
      {ICONS[name].map((d, i) => (
        <Path key={i} d={d} />
      ))}
    </Svg>
  );
}
