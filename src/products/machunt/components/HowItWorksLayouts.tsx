import { useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config/site.config';
import { getIcon } from '../config/icon-map';
import SectionWrapper from './SectionWrapper';
import SectionTitle from './SectionTitle';

export function HowItWorksHorizontal() {
  const { sectionTitle, steps } = siteConfig.howItWorks;
  if (!sectionTitle) return null;

  return (
    <SectionWrapper id="how-it-works">
      <SectionTitle {...sectionTitle} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {steps.map((step, i) => {
          const Icon = getIcon(step.icon);
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group rounded-2xl p-8 transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'var(--color-glass-bg)',
                border: '1px solid var(--color-glass-border)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold opacity-20" style={{ color: 'var(--accent-primary)' }}>
                  {step.number}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${step.color.split(' ')[0].replace('from-', '')}, var(--accent-primary)20)`,
                  }}
                >
                  <Icon className={`w-5 h-5 ${step.iconColor}`} />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

export function HowItWorksVerticalTimeline() {
  const { sectionTitle, steps } = siteConfig.howItWorks;
  if (!sectionTitle) return null;

  return (
    <SectionWrapper id="how-it-works">
      <SectionTitle {...sectionTitle} />
      <div className="mt-12 max-w-3xl mx-auto">
        {steps.map((step, i) => {
          const Icon = getIcon(step.icon);
          const isLast = i === steps.length - 1;

          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="flex gap-6"
            >
              {/* Timeline line & dot */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 + 0.3, type: 'spring' }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                  style={{ backgroundColor: 'var(--color-glass-bg)', border: '1px solid var(--accent-primary)30' }}
                >
                  <Icon className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                </motion.div>
                {!isLast && (
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.2 + 0.5 }}
                    className="w-px flex-1 my-2"
                    style={{ backgroundColor: 'var(--color-glass-border)' }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-16 flex-1">
                <span
                  className="text-sm font-mono font-bold mb-2 block"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  STEP {step.number}
                </span>
                <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="leading-relaxed text-lg" style={{ color: 'var(--text-secondary)' }}>
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

export function HowItWorksCardStack() {
  const { sectionTitle, steps } = siteConfig.howItWorks;
  const [active, setActive] = useState(0);

  if (!sectionTitle) return null;

  return (
    <SectionWrapper id="how-it-works">
      <SectionTitle {...sectionTitle} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 max-w-4xl mx-auto"
      >
        {/* Step indicator dots + labels */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {steps.map((step, i) => {
            const isActive = i === active;
            return (
              <button
                key={step.number}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${isActive ? 'scale-105 shadow-lg' : 'opacity-60 hover:opacity-90'}`}
                style={{
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--color-glass-bg)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--color-glass-border)'}`,
                }}
              >
                <span className={`text-xs font-mono font-bold ${isActive ? 'text-white/80' : ''}`}
                  style={{ color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--accent-primary)' }}>
                  {step.number}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active card */}
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-8 md:p-12 relative overflow-hidden"
          style={{
            backgroundColor: 'var(--color-glass-bg)',
            border: '1px solid var(--color-glass-border)',
          }}
        >
          {(() => {
            const step = steps[active];
            const Icon = getIcon(step.icon);
            return (
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, var(--accent-primary)30, var(--accent-secondary)20)`,
                  }}
                >
                  <Icon className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--accent-primary)', border: '1px solid var(--badge-border)' }}>
                      STEP {step.number}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                  <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="absolute -bottom-4 -right-4 text-8xl font-bold opacity-[0.03] select-none"
            style={{ color: 'var(--accent-primary)' }}>
            {steps[active].number}
          </div>
        </motion.div>

        {/* Step progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === active ? 'var(--accent-primary)' : 'var(--color-glass-border)',
                transform: i === active ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
