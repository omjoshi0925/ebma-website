/**
 * The complete placeholder registry. Each page owns one group file; ids must be unique across
 * groups (scripts/placeholders.ts checks this). To fill a placeholder, set its `value`.
 */
import type { PlaceholderDef } from '../../lib/placeholders';
import global from './global';
import home from './home';
import about from './about';
import events from './events';
import resources from './resources';
import getInvolved from './get-involved';
import sponsors from './sponsors';
import privacy from './privacy';

export const groups = {
  global,
  home,
  about,
  events,
  resources,
  'get-involved': getInvolved,
  sponsors,
  privacy,
} as const;

export const registry: Record<string, PlaceholderDef> = Object.assign({}, ...Object.values(groups));

export function getPlaceholder(id: string): PlaceholderDef {
  const def = registry[id];
  if (!def) throw new Error(`Unknown placeholder id "${id}". Declare it in src/data/placeholders/.`);
  return def;
}

/** The filled value, or null while it is still a placeholder. */
export const valueOf = (id: string): string | null => getPlaceholder(id).value;
