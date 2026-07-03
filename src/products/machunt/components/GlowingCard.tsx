import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export default function GlowingCard({ children, className = '', hover = true, delay = 0 }: GlowingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      className={`glass-card p-6 md:p-8 relative overflow-hidden group ${
        hover ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className="absolute -inset-2 blur-xl"
          style={{ background: 'var(--gradient-card-hover)' }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
