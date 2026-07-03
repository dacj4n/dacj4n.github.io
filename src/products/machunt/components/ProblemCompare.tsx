import { motion } from 'framer-motion';
import { getIcon } from '../config/icon-map';
import SectionWrapper from './SectionWrapper';
import SectionTitle from './SectionTitle';
import type { ProblemCompareConfig } from '../config/config.types';

interface Props {
  config: ProblemCompareConfig;
}

export default function ProblemCompare({ config }: Props) {
  const { sectionTitle, leftPanel, rightPanel } = config;
  const LeftIcon = getIcon(leftPanel.icon);
  const RightIcon = getIcon(rightPanel.icon);

  return (
    <SectionWrapper id="compare">
      <SectionTitle
        label={sectionTitle.label}
        title={sectionTitle.title}
        description={sectionTitle.description}
      />

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Traditional (Left) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card p-8 relative group"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <LeftIcon className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">{leftPanel.title}</h3>
          </div>

          <div className="space-y-4">
            {leftPanel.steps.map((step, i) => {
              const Icon = getIcon(step.icon);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + step.delay, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-3)] border border-white/[0.04] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-sm text-[var(--text-muted)]">{step.label}</span>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-1 my-4 pl-4">
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="w-px h-6 bg-gradient-to-b from-red-500/20 to-transparent"
              />
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium"
            >
              {leftPanel.badge}
            </motion.div>
          </div>

          {leftPanel.bottomLabel && (
            <div className="flex items-center gap-3 pl-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-3)] border border-white/[0.04] flex items-center justify-center shrink-0">
                <LeftIcon className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <span className="text-sm text-[var(--text-muted)]">{leftPanel.bottomLabel}</span>
            </div>
          )}
        </motion.div>

        {/* Living Society (Right) */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card p-8 relative group overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-blue-500/50" />
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex items-center gap-3 mb-6 relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center">
              <RightIcon className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">{rightPanel.title}</h3>
          </div>

          <div className="space-y-4 relative">
            {rightPanel.steps.map((step, i) => {
              const Icon = getIcon(step.icon);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + step.delay, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">{step.label}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Multi-agent flow */}
          <div className="flex flex-col items-center gap-1 my-4 pl-4 relative">
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="w-px h-6 bg-gradient-to-b from-purple-500/30 to-transparent"
              />
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-purple-500/5 border border-purple-500/10"
            >
              {(rightPanel.agentNames ?? []).map((name, i) => (
                <motion.span
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-xs text-purple-300 font-mono"
                >
                  {name}
                </motion.span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center gap-2 pl-4"
          >
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-xs text-purple-300 font-medium">
              {rightPanel.badge}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
