import { ReactNode } from 'react';
import { PLUGIN_SIZE } from '../constants/plugin-size';

interface PluginLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Layout principal del plugin - tamaño fijo, sin scroll en la página
 * Usa este componente como wrapper de tus páginas para garantizar
 * que todo el contenido cabe en el viewport del plugin
 */
export function PluginLayout({ children, className = '' }: PluginLayoutProps) {
  return (
    <div 
      className={`page ${className}`}
      style={{ 
        width: PLUGIN_SIZE.WIDTH,
        height: PLUGIN_SIZE.HEIGHT,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Componente para secciones que deben ocupar el espacio disponible
 * y pueden tener scroll interno si el contenido es muy largo
 */
interface ScrollableContentProps {
  children: ReactNode;
  className?: string;
}

export function ScrollableContent({ children, className = '' }: ScrollableContentProps) {
  return (
    <div className={`scrollable flex-1 min-h-0 ${className}`}>
      {children}
    </div>
  );
}
