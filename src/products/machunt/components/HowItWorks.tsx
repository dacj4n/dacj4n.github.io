import { motion } from 'framer-motion';
import { getIcon } from '../config/icon-map';
import SectionWrapper from './SectionWrapper';
import SectionTitle from './SectionTitle';
import type { HowItWorksConfig } from '../config/config.types';

interface Props {
  config: HowItWorksConfig;
}

export default function HowItWorks({ config }: Props) {
  return (
    <SectionWrapper id="how-it-works">
      <SectionTitle
        label={config.sectionTitle.label}
        title={config.sectionTitle.title}
        description={config.sectionTitle.description}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.steps.map((step, i) => {
          const Icon = getIcon(step.icon);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="glass-card p-6 relative group"
            >
              <span className="absolute top-6 right-6 text-5xl font-display font-bold text-white/[0.03] select-none">
                {step.number}
              </span>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} border ${step.border} flex items-center justify-center mb-5`}>
                <Icon className={`w-6 h-6 ${step.iconColor}`} />
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {step.description}
              </p>
              {i < config.steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 24 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                    className="h-px bg-gradient-to-r from-white/[0.08] to-transparent"
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
