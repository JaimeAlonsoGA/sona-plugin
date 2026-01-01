import { PLUGIN_SIZE, getContentHeight } from '../constants/plugin-size';

interface UsePluginSizeReturn {
  /** Tamaño fijo del plugin */
  width: number;
  height: number;
  /** Altura disponible para contenido (restando header/footer) */
  contentHeight: number;
}

/**
 * Hook para obtener el tamaño fijo del plugin
 * El plugin NO es redimensionable, así que estos valores son constantes
 */
export function usePluginSize(
  hasHeader = false, 
  hasFooter = false
): UsePluginSizeReturn {
  return {
    width: PLUGIN_SIZE.WIDTH,
    height: PLUGIN_SIZE.HEIGHT,
    contentHeight: getContentHeight(hasHeader, hasFooter),
  };
}
