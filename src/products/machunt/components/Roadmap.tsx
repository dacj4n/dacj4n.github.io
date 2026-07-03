import { motion } from 'framer-motion';
import { getIcon } from '../config/icon-map';
import SectionWrapper from './SectionWrapper';
import SectionTitle from './SectionTitle';
import type { RoadmapConfig } from '../config/config.types';

interface Props {
  config: RoadmapConfig;
}

export default function Roadmap({ config }: Props) {
  const CheckIcon = getIcon('CheckCircle2');
  const ClockIcon = getIcon('Clock');
  const CircleIcon = getIcon('Circle');

  return (
    <SectionWrapper id="roadmap">
      <SectionTitle
        label={config.sectionTitle.label}
        title={config.sectionTitle.title}
        description={config.sectionTitle.description}
      />

      <div className="max-w-2xl mx-auto">
        {config.milestones.map((milestone, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="relative pl-12 pb-10 last:pb-0"
          >
            {i < config.milestones.length - 1 && (
              <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-purple-500/20 via-white/[0.04] to-transparent" />
            )}

            <div className="absolute left-0 top-1">
              {milestone.status === 'done' ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center"
                >
                  <CheckIcon className="w-5 h-5 text-purple-400" />
                </motion.div>
              ) : milestone.status === 'current' ? (
                <motion.div
                  animate={{ boxShadow: ['0 0 0 0 rgba(59,130,246,0)', '0 0 0 6px rgba(59,130,246,0.1)', '0 0 0 0 rgba(59,130,246,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center"
                >
                  <ClockIcon className="w-5 h-5 text-blue-400" />
                </motion.div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                  <CircleIcon className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>

            <div className={milestone.highlight ? 'glass-card p-5' : 'p-5'}>
              <span className={`text-xs font-medium uppercase tracking-wider ${
                milestone.status === 'done' ? 'text-purple-400' :
                milestone.status === 'current' ? 'text-blue-400' : 'text-gray-600'
              }`}>
                {milestone.phase}
              </span>
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mt-1 mb-1">
                {milestone.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {milestone.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
