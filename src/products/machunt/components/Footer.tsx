import { motion } from 'framer-motion';
import { getIcon } from '../config/icon-map';
import type { FooterConfig } from '../config/config.types';

interface Props {
  config: FooterConfig;
}

export default function Footer({ config }: Props) {
  const ExternalLinkIcon = getIcon('ExternalLink');
  const ArrowUpRightIcon = getIcon('ArrowUpRight');

  return (
    <footer className="relative z-10 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-flex items-center gap-2.5 mb-4">
              <img src="/machunt/icon.png" alt={config.brandName} className="w-8 h-8 rounded-lg" />
              <span className="font-display font-semibold text-[var(--text-primary)] text-lg tracking-tight">
                {config.brandName}
              </span>
            </a>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mb-6">
              {config.description}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-all">
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-all">
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(config.linkGroups).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="glow-line mb-10" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} {config.copyright}
          </p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-500 italic"
          >
            &ldquo;{config.quote}&rdquo;
          </motion.p>

          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[var(--text-primary)] transition-colors"
          >
            Back to top
            <ArrowUpRightIcon className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
