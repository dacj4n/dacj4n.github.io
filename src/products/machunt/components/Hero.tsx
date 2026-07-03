import { motion } from 'framer-motion';
import { getIcon } from '../config/icon-map';
import type { HeroConfig } from '../config/config.types';
import type { ThemeVars } from '../config/themes/types';

const floatingIcons = [
  { icon: 'Sparkles', className: 'top-[15%] left-[5%] text-purple-400/30 animate-float', size: 32 },
  { icon: 'Sparkles', className: 'top-[20%] right-[8%] text-blue-400/20 animate-float-delayed', size: 24 },
  { icon: 'Sparkles', className: 'bottom-[25%] left-[10%] text-cyan-400/20 animate-float-delayed', size: 28 },
  { icon: 'Sparkles', className: 'top-[40%] right-[15%] text-emerald-400/15 animate-float', size: 20 },
  { icon: 'Sparkles', className: 'bottom-[35%] right-[5%] text-purple-300/20 animate-float', size: 22 },
];

interface HeroProps {
  config: HeroConfig;
  theme: ThemeVars;
}

export default function Hero({ config, theme }: HeroProps) {
  const PrimaryIcon = getIcon(config.cta.primary.icon);
  const SecondaryIcon = getIcon(config.cta.secondary.icon);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora Gradient Orbs — themed */}
      {theme.heroOrbs.map((orb, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
          transition={{
            duration: 8,
            delay: i * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute ${orb.size} ${orb.pos} ${orb.color} rounded-full blur-[120px] pointer-events-none`}
        />
      ))}

      {/* Floating Icons */}
      {floatingIcons.map((item, i) => {
        const Icon = getIcon(item.icon);
        return (
          <Icon
            key={i}
            size={item.size}
            className={`absolute hidden md:block ${item.className}`}
          />
        );
      })}

      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-surface)]/50 to-[var(--color-surface)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border"
            style={{
              backgroundColor: 'var(--badge-bg)',
              borderColor: 'var(--badge-border)',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            <span className="text-xs font-medium tracking-wider uppercase" style={{ color: 'var(--badge-text)' }}>
              {config.badge}
            </span>
          </motion.div>

          {/* Main Title */}
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
            {config.title.prefix}
            <span className="gradient-text">{config.title.highlight}</span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-[var(--text-secondary)] font-light mb-4 max-w-2xl mx-auto"
          >
            {config.subtitle}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-base md:text-lg text-[var(--text-muted)] mb-12 max-w-xl mx-auto leading-relaxed"
          >
            {config.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href={config.cta.primary.href}
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black font-medium text-sm hover:bg-gray-100 transition-all shadow-lg shadow-white/5"
            >
              {config.cta.primary.text}
              <PrimaryIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href={config.cta.secondary.href}
              target={config.cta.secondary.isExternal ? '_blank' : undefined}
              rel={config.cta.secondary.isExternal ? 'noopener noreferrer' : undefined}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[var(--text-primary)] font-medium text-sm hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
            >
              <SecondaryIcon className="w-4 h-4" />
              {config.cta.secondary.text}
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/[0.1] flex items-start justify-center p-1"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-1 rounded-full bg-white/40"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
