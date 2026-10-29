// Tokens de DESIGN.md. Única fuente de colores, tipografía, espaciado y movimiento de la app.
// Ningún componente debe usar hex sueltos: todo sale de aquí vía useTheme().

export const fills = {
  onFill: '#16141d',
  lilac: '#c9b8ff',
  lime: '#e4f47c',
  sky: '#a7d6f6',
  mint: '#a6e8cc',
  peach: '#f7c99a',
  coral: '#ff8a8a',
} as const;

export type FillName = Exclude<keyof typeof fills, 'onFill'>;

const dark = {
  background: '#16141d',
  foreground: '#f3f0fa',
  card: '#211e2b',
  muted: '#2c2839',
  mutedForeground: '#aaa4bd',
  primary: '#f3f0fa',
  primaryForeground: '#16141d',
  accent: fills.lime as string,
  border: '#e6e1f2',
  ring: fills.lime as string,
  shadow: '#5a5180',
  destructiveText: '#ff8a8a',
  star: '#f7c99a',
  scrim: 'rgba(10, 8, 16, 0.6)',
};

const light: typeof dark = {
  background: '#f7f4ee',
  foreground: '#1c1631',
  card: '#fffdf9',
  muted: '#eee9e0',
  mutedForeground: '#5d5770',
  primary: '#1c1631',
  primaryForeground: '#f7f4ee',
  accent: fills.lime,
  border: '#1c1631',
  ring: '#1c1631',
  shadow: '#1c1631',
  destructiveText: '#b3261e',
  star: '#b8651c',
  scrim: 'rgba(28, 22, 49, 0.5)',
};

export const palettes = { dark, light };
export type Colors = typeof dark;
export type Scheme = keyof typeof palettes;

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semibold: 'Lexend_600SemiBold',
  bold: 'Lexend_700Bold',
} as const;

// Escala tipográfica (pt). letterSpacing en pt = em × tamaño.
export const type = {
  display: { fontFamily: fonts.display, fontSize: 46, lineHeight: 52, letterSpacing: -1.6 },
  h1: { fontFamily: fonts.display, fontSize: 34, lineHeight: 36, letterSpacing: -0.7 },
  h1Sm: { fontFamily: fonts.display, fontSize: 30, lineHeight: 33, letterSpacing: -0.6 },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 27, letterSpacing: -0.24 },
  stat: { fontFamily: fonts.display, fontSize: 24, lineHeight: 27 },
  code: { fontFamily: fonts.display, fontSize: 52, lineHeight: 58, letterSpacing: 9 },
  title: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 15, letterSpacing: 1, textTransform: 'uppercase' as const },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20 },
  buttonLg: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  chip: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18 },
  tag: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 16 },
  nav: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 15 },
} as const;

export type TypeVariant = keyof typeof type;

// Multiplicador máximo de Dynamic Type por variante.
export const maxScale: Partial<Record<TypeVariant, number>> = {
  display: 1.4,
  h1: 1.4,
  h1Sm: 1.4,
  code: 1.4,
  nav: 1.3,
};

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 12: 48 } as const;

export const radius = { sm: 12, md: 16, lg: 20, sheet: 28, pill: 999 } as const;

export const layout = {
  screenX: 20,
  screenBottom: 28,
  sectionGap: 16,
  cardPadding: 16,
  cardGap: 12,
  maxContentWidth: 560,
  tabBarHeight: 64,
  fabSize: 58,
  fabGap: 16,
  fabClearance: 90, // margen extra al final de las listas para que la burbuja no tape nada
} as const;

export const size = {
  button: 52,
  buttonLg: 56,
  buttonSecondary: 48,
  field: 52,
  iconButton: 44,
  iconButtonLg: 64,
  iconTile: 52,
  statusIcon: 96,
  avatar: { sm: 34, md: 44, lg: 76, xl: 84 },
  icon: { sm: 18, md: 24, lg: 32, xl: 44 },
  tabIndicator: { width: 56, height: 32 },
} as const;

export const borderWidth = 2;

export type Elevation = 'none' | 'sm' | 'md' | 'lg' | 'pressed';
const offsets: Record<Exclude<Elevation, 'none'>, number> = { sm: 2, md: 3, lg: 4, pressed: 1 };

/** Sombra dura (sin desenfoque) en el color del tema. */
export function hardShadow(level: Elevation, color: string) {
  if (level === 'none') return undefined;
  const o = offsets[level];
  return `${o}px ${o}px 0px ${color}`;
}

export const motion = {
  duration: { press: 80, micro: 150, state: 200, enter: 550, pop: 450, sheet: 450, swipe: 600, exit: 250 },
  stagger: { step: 50, max: 500 },
  // cubic-bezier → para Easing.bezier de Reanimated
  bezier: {
    out: [0.2, 0.8, 0.2, 1],
    bounce: [0.2, 0.9, 0.25, 1.15],
    pop: [0.3, 1.5, 0.5, 1],
    sheet: [0.2, 0.9, 0.3, 1.1],
  },
} as const;

// Color de relleno y icono por categoría de plan.
export const categories = {
  estudio: { label: 'Estudio', fill: 'lilac', icon: 'menu_book' },
  deporte: { label: 'Deporte', fill: 'lime', icon: 'sports_soccer' },
  musica: { label: 'Música', fill: 'lilac', icon: 'music_note' },
  cine: { label: 'Cine', fill: 'sky', icon: 'movie' },
  comida: { label: 'Comida', fill: 'peach', icon: 'restaurant' },
  fiesta: { label: 'Fiesta', fill: 'coral', icon: 'nightlife' },
  voluntariado: { label: 'Voluntariado', fill: 'mint', icon: 'volunteer_activism' },
  juegos: { label: 'Juegos', fill: 'peach', icon: 'sports_esports' },
  arte: { label: 'Arte', fill: 'lilac', icon: 'palette' },
  naturaleza: { label: 'Naturaleza', fill: 'mint', icon: 'park' },
  cultura: { label: 'Cultura', fill: 'sky', icon: 'theater_comedy' },
} as const;

export type CategoryKey = keyof typeof categories;
export const categoryKeys = Object.keys(categories) as CategoryKey[];
