import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from '../config/icon-map';
import type { NavbarConfig } from '../config/config.types';

interface NavbarProps {
  config: NavbarConfig;
  logoText: string;
}

export default function Navbar({ config, logoText }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const MenuIcon = getIcon('Menu');
  const XIcon = getIcon('X');
  const GithubIcon = getIcon(config.github.icon);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 py-5"
        style={{
          backgroundColor: scrolled ? 'var(--color-glass-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-glass-border)' : '1px solid transparent',
          transition: 'background-color 0.4s ease, backdrop-filter 0.4s ease, border-bottom-color 0.4s ease, padding 0.4s ease',
          paddingTop: scrolled ? '0.75rem' : '1.25rem',
          paddingBottom: scrolled ? '0.75rem' : '1.25rem',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 group">
            <img src="/machunt/icon.png" alt={logoText} className="w-8 h-8 rounded-lg group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-shadow" />
            <span className="font-display font-semibold text-[var(--text-primary)] text-lg tracking-tight">
              {logoText}
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {config.navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-white/[0.04]"
              >
                {link.label}
              </a>
            ))}
            <a
              href={config.github.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-white/[0.06] border border-white/[0.08] rounded-lg hover:bg-white/[0.1] transition-all inline-flex items-center gap-2"
            >
              <GithubIcon className="w-4 h-4" />
              {config.github.text}
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[var(--color-surface-2)] border-l border-white/[0.06] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setMobileOpen(false)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {config.navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-4 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] rounded-lg transition-all"
                  >
                    {link.label}
                  </motion.a>
                ))}
                <motion.a
                  href={config.github.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 px-4 py-3 text-[var(--text-primary)] bg-white/[0.06] border border-white/[0.08] rounded-lg text-center inline-flex items-center justify-center gap-2"
                >
                  <GithubIcon className="w-4 h-4" />
                  {config.github.text}
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
