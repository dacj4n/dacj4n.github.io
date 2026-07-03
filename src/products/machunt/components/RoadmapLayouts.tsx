import { motion } from 'framer-motion';
import { siteConfig } from '../config/site.config';
import SectionWrapper from './SectionWrapper';
import SectionTitle from './SectionTitle';

export function RoadmapTimeline() {
  const { sectionTitle, milestones } = siteConfig.roadmap;
  if (!sectionTitle) return null;

  return (
    <SectionWrapper id="roadmap">
      <SectionTitle {...sectionTitle} />
      <div className="mt-12 max-w-4xl mx-auto">
        {milestones.map((ms, i) => {
          const statusConfig = {
            done: { dotColor: 'var(--accent-primary)', lineColor: 'var(--accent-primary)', badge: '✅ Done' },
            current: { dotColor: 'var(--accent-secondary)', lineColor: 'var(--accent-secondary)50', badge: '🚀 In Progress' },
            upcoming: { dotColor: 'var(--text-muted)', lineColor: 'var(--text-muted)30', badge: '📋 Planned' },
          }[ms.status];

          const isLast = i === milestones.length - 1;

          return (
            <motion.div
              key={ms.phase}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex gap-6"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.3, type: 'spring' }}
                  className="w-4 h-4 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: statusConfig.dotColor }}
                />
                {!isLast && (
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.15 + 0.5 }}
                    className="w-px flex-1 my-1"
                    style={{ backgroundColor: statusConfig.lineColor }}
                  />
                )}
              </div>

              <div className={`pb-12 flex-1 ${ms.highlight ? 'relative' : ''}`}>
                <span
                  className="text-xs font-mono font-bold px-2 py-1 rounded-full inline-block mb-3"
                  style={{
                    backgroundColor: 'var(--badge-bg)',
                    color: 'var(--badge-text)',
                    border: '1px solid var(--badge-border)',
                  }}
                >
                  {statusConfig.badge}
                </span>
                <span className="text-sm ml-3" style={{ color: 'var(--text-muted)' }}>
                  {ms.phase}
                </span>
                <h3
                  className={`text-xl font-bold mt-2 mb-2 ${ms.highlight ? 'text-2xl' : ''}`}
                  style={{ color: 'var(--text-primary)' }}
                >
                  {ms.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {ms.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

export function RoadmapKanban() {
  const { sectionTitle, milestones } = siteConfig.roadmap;
  if (!sectionTitle) return null;

  const columns = {
    done: { title: '✅ Completed', items: milestones.filter((m) => m.status === 'done') },
    current: { title: '🚀 In Progress', items: milestones.filter((m) => m.status === 'current') },
    upcoming: { title: '📋 Planned', items: milestones.filter((m) => m.status === 'upcoming') },
  };

  const colColors: Record<string, { border: string; bg: string }> = {
    done: { border: 'var(--accent-primary)30', bg: 'var(--accent-primary)08' },
    current: { border: 'var(--accent-secondary)30', bg: 'var(--accent-secondary)08' },
    upcoming: { border: 'var(--text-muted)20', bg: 'var(--text-muted)05' },
  };

  return (
    <SectionWrapper id="roadmap">
      <SectionTitle {...sectionTitle} />
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {Object.entries(columns).map(([key, col], ci) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: ci * 0.2 }}
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--color-glass-bg)',
              border: '1px solid var(--color-glass-border)',
            }}
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colColors[key].border }}
              />
              {col.title}
              <span className="text-sm ml-auto" style={{ color: 'var(--text-muted)' }}>
                {col.items.length}
              </span>
            </h3>

            <div className="flex flex-col gap-4">
              {col.items.length === 0 && (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  No items
                </p>
              )}
              {col.items.map((ms, i) => (
                <motion.div
                  key={ms.phase}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: ci * 0.2 + i * 0.1 }}
                  className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    backgroundColor: colColors[key].bg,
                    border: `1px solid ${colColors[key].border}`,
                  }}
                >
                  <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-muted)' }}>
                    {ms.phase}
                  </span>
                  <h4
                    className={`font-bold mt-1 mb-2 ${ms.highlight ? 'text-lg' : 'text-base'}`}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {ms.title}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {ms.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
