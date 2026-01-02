/**
 * Sona Logo Component
 * 
 * Minimal, confident brand mark
 */

import { motion } from 'framer-motion'

interface SonaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
}

const sizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
}

export function SonaLogo({ size = 'md', animate = true }: SonaLogoProps) {
  return (
    <motion.span
      className={`sona-logo ${sizes[size]}`}
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      sona
    </motion.span>
  )
}
