import { motion } from 'framer-motion';
import { siteConfig } from '../config/site.config';
import { getIcon } from '../config/icon-map';
import ParticleField from './ParticleField';

export function HeroSplit() {
  const hero = siteConfig.hero;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <ParticleField
        hueMin={220}
        hueMax={280}
        connectionColor="rgba(124, 58, 237, 0.06)"
        countMultiplier={1}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{
                backgroundColor: 'var(--badge-bg)',
                border: '1px solid var(--badge-border)',
                color: 'var(--badge-text)',
              }}
            >
              {hero.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              {hero.title.prefix}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                {hero.title.highlight}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl mb-4"
              style={{ color: 'var(--accent-primary)' }}
            >
              {hero.subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg leading-relaxed mb-10 max-w-xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              {hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href={hero.cta.primary.href}
                className="px-8 py-3.5 rounded-full font-semibold text-white flex items-center gap-2
                  bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600
                  transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
              >
                {hero.cta.primary.text}
                {(() => {
                  const Icon = getIcon(hero.cta.primary.icon);
                  return <Icon className="w-5 h-5" />;
                })()}
              </a>
              <a
                href={hero.cta.secondary.href}
                target={hero.cta.secondary.isExternal ? '_blank' : undefined}
                rel={hero.cta.secondary.isExternal ? 'noopener noreferrer' : undefined}
                className="px-8 py-3.5 rounded-full font-semibold flex items-center gap-2
                  border transition-all duration-300 hover:scale-105"
                style={{
                  color: 'var(--text-primary)',
                  borderColor: 'var(--color-glass-border)',
                  backgroundColor: 'var(--color-glass-bg)',
                }}
              >
                {hero.cta.secondary.text}
                {(() => {
                  const Icon = getIcon(hero.cta.secondary.icon);
                  return <Icon className="w-5 h-5" />;
                })()}
              </a>
            </motion.div>
          </motion.div>

          {/* Right: Visual / Abstract Art */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full aspect-square max-w-[500px]">
              {/* Abstract geometric shapes */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-80 h-80 rounded-full border-2 opacity-20"
                style={{ borderColor: 'var(--accent-primary)' }}
              />
              <motion.div
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-64 h-64 rounded-full border opacity-15"
                style={{ borderColor: 'var(--accent-secondary)' }}
              />
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-48 h-48 rounded-2xl border opacity-10 rotate-45"
                style={{ borderColor: 'var(--accent-primary)' }}
              />

              {/* Floating icon orbs */}
              {[
                { icon: 'Brain', pos: 'top-4 left-8', delay: 0 },
                { icon: 'Globe', pos: 'top-12 right-4', delay: 0.5 },
                { icon: 'Zap', pos: 'bottom-8 left-4', delay: 1 },
                { icon: 'Cpu', pos: 'bottom-16 right-12', delay: 1.5 },
              ].map(({ icon, pos, delay }) => {
                const Icon = getIcon(icon);
                return (
                  <motion.div
                    key={icon}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: delay + 0.8, type: 'spring' }}
                    className={`absolute ${pos} p-4 rounded-2xl`}
                    style={{
                      backgroundColor: 'var(--color-glass-bg)',
                      border: '1px solid var(--color-glass-border)',
                    }}
                  >
                    <Icon className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
