import { motion } from 'framer-motion';
import { getIcon } from '../config/icon-map';
import SectionWrapper from './SectionWrapper';
import SectionTitle from './SectionTitle';
import type { ArchitectureConfig } from '../config/config.types';

interface Props {
  config: ArchitectureConfig;
}

export default function Architecture({ config }: Props) {
  const ArrowDownIcon = getIcon('ArrowUpRight');

  return (
    <SectionWrapper id="architecture">
      <SectionTitle
        label={config.sectionTitle.label}
        title={config.sectionTitle.title}
        description={config.sectionTitle.description}
      />

      <div className="max-w-xl mx-auto">
        {config.layers.map((layer, i) => {
          const Icon = getIcon(layer.icon);
          return (
            <div key={i} className="relative">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: layer.delay, duration: 0.6 }}
                className="glass-card p-5 relative overflow-hidden group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${layer.color} border flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${layer.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-[var(--text-primary)] text-base">
                      {layer.label}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                      {layer.description}
                    </p>
                  </div>
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {[...Array(3)].map((_, j) => (
                    <motion.div
                      key={j}
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ delay: j * 0.2, duration: 1.5, repeat: Infinity }}
                      className={`w-1 h-1 rounded-full ${layer.iconColor.replace('text-', 'bg-')}`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Connector arrow */}
              {i < config.layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
                    className="flex flex-col items-center gap-1 origin-top"
                  >
                    <div className="w-px h-5 bg-gradient-to-b from-purple-500/20 to-blue-500/20" />
                    <div className="w-5 h-5 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                      <ArrowDownIcon className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="w-px h-5 bg-gradient-to-b from-blue-500/20 to-purple-500/20" />
                  </motion.div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Animated connection lines background */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ delay: i * 0.2, duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {config.bottomText}
          </span>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
