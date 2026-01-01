/**
 * Constantes de tamaño del plugin - FIJO, no redimensionable
 * Mantener sincronizado con las constantes en PluginEditor.cpp
 */

export const PLUGIN_SIZE = {
  WIDTH: 800,
  HEIGHT: 600,
} as const;

/**
 * Alturas sugeridas para diferentes secciones de la UI
 * El plugin es de tamaño fijo, así que estas alturas son absolutas
 */
export const UI_HEIGHTS = {
  HEADER: 48,
  FOOTER: 40,
  PLAYER_COMPACT: 60,
  PLAYER_FULL: 120,
} as const;

/**
 * Calcula la altura disponible para el contenido principal
 * Útil cuando tienes header/footer fijos
 */
export function getContentHeight(hasHeader = true, hasFooter = true): number {
  let available = PLUGIN_SIZE.HEIGHT;
  if (hasHeader) available -= UI_HEIGHTS.HEADER;
  if (hasFooter) available -= UI_HEIGHTS.FOOTER;
  return available;
}
