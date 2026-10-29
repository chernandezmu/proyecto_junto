// Genera src/components/icons.generated.ts con los iconos de Material Symbols Rounded
// (peso 500) que usa la app. Rellenos por defecto; los nombres que terminan en
// "_outline" usan la variante de contorno. Ejecutar: npm run icons
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', '@material-symbols', 'svg-500', 'rounded');
const out = join(root, 'src', 'components', 'icons.generated.ts');

const NAMES = [
  // navegación y acciones
  'arrow_back', 'arrow_forward', 'arrow_outward', 'close', 'check', 'check_circle', 'add', 'add_circle',
  'remove', 'chevron_right', 'expand_more', 'more_horiz', 'refresh', 'open_in_new', 'edit', 'send',
  'ios_share', 'bookmark', 'tune', 'swipe', 'done_all', 'logout', 'delete', 'download',
  // pestañas y módulos
  'home', 'celebration', 'directions_car', 'landscape', 'event_note', 'route', 'hail',
  // planes
  'event_busy', 'event_available', 'event_seat', 'schedule', 'timer', 'lock_clock', 'location_on',
  'map', 'chat', 'forum', 'push_pin', 'alarm', 'notifications', 'notifications_active', 'where_to_vote',
  'groups', 'star', 'star_outline', 'thumb_up', 'local_fire_department', 'explore',
  // identidad y seguridad
  'verified', 'verified_user', 'badge', 'lock', 'mail', 'flag', 'report', 'block', 'gavel', 'shield',
  'school', 'person', 'person_off', 'call', 'help',
  // ajustes
  'settings', 'language', 'dark_mode', 'light_mode', 'contrast', 'visibility',
  // archivos
  'add_a_photo', 'photo_camera', 'upload_file', 'image', 'calendar_month',
  // estados
  'hourglass_top', 'cloud_off', 'error', 'info', 'sentiment_dissatisfied', 'link_off',
  // categorías
  'menu_book', 'sports_soccer', 'music_note', 'movie', 'restaurant', 'nightlife', 'volunteer_activism',
  'sports_esports', 'palette', 'park', 'theater_comedy',
];

// Nombres del diseño que cambiaron en el paquete de Material Symbols.
const ALIASES = { push_pin: 'keep', expand_more: 'keyboard_arrow_down' };

const icons = {};
for (const name of NAMES) {
  const outline = name.endsWith('_outline');
  const raw = outline ? name.slice(0, -'_outline'.length) : name;
  const base = ALIASES[raw] ?? raw;
  const fill = join(src, `${base}-fill.svg`);
  const plain = join(src, `${base}.svg`);
  const file = !outline && existsSync(fill) ? fill : plain;
  if (!existsSync(file)) throw new Error(`No existe el icono "${name}" (${file})`);
  const svg = readFileSync(file, 'utf8');
  const paths = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
  if (!paths.length) throw new Error(`Sin trazos en ${file}`);
  icons[name] = paths;
}

const body = Object.entries(icons)
  .map(([k, v]) => `  ${k}: ${JSON.stringify(v)},`)
  .join('\n');

writeFileSync(
  out,
  `// Archivo generado por scripts/build-icons.mjs — no editar a mano.\n` +
    `// Material Symbols Rounded (Apache-2.0), peso 500. viewBox "0 -960 960 960".\n` +
    `export const ICONS = {\n${body}\n} as const satisfies Record<string, readonly string[]>;\n\n` +
    `export type IconName = keyof typeof ICONS;\n`,
);
console.log(`${Object.keys(icons).length} iconos → ${out}`);
