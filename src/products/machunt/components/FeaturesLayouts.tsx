import { motion } from 'framer-motion';
import { siteConfig } from '../config/site.config';
import { getIcon } from '../config/icon-map';
import SectionWrapper from './SectionWrapper';
import SectionTitle from './SectionTitle';

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const Icon = getIcon(feature.icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] cursor-default"
      style={{
        backgroundColor: 'var(--color-glass-bg)',
        border: '1px solid var(--color-glass-border)',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
          group-hover:scale-110 group-hover:shadow-lg"
        style={{ backgroundColor: feature.bgColor || 'var(--color-glass-highlight)' }}
      >
        <Icon className={`w-6 h-6 ${feature.color}`} />
      </div>
      <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        {feature.title}
      </h3>
      <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {feature.description}
      </p>
    </motion.div>
  );
}

export function FeaturesGrid() {
  const { sectionTitle, features } = siteConfig.coreFeatures;

  if (!sectionTitle) return null;

  return (
    <SectionWrapper id="features">
      <SectionTitle {...sectionTitle} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}

export function FeaturesAlternating() {
  const { sectionTitle, features } = siteConfig.coreFeatures;

  if (!sectionTitle) return null;

  return (
    <SectionWrapper id="features">
      <SectionTitle {...sectionTitle} />
      <div className="mt-12 flex flex-col gap-20">
        {features.map((feature, i) => {
          const Icon = getIcon(feature.icon);
          const isLeft = i % 2 === 0;

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
            >
              {/* Text side */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0"
                  style={{ backgroundColor: feature.bgColor || 'var(--color-glass-highlight)' }}
                >
                  <Icon className={`w-7 h-7 ${feature.color}`} />
                </motion.div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-lg leading-relaxed max-w-lg mx-auto lg:mx-0" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>

              {/* Visual side — abstract art */}
              <div className="flex-1 flex justify-center">
                <motion.div
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-3xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, var(--accent-primary)20, var(--accent-secondary)15, var(--color-surface-3))`,
                    border: '1px solid var(--color-glass-border)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-20 h-20 opacity-30" style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  {/* Decorative circles */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-6 right-6 w-20 h-20 rounded-full"
                    style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.15 }}
                  />
                  <motion.div
                    animate={{ scale: [1.1, 1, 1.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-8 left-8 w-16 h-16 rounded-full"
                    style={{ backgroundColor: 'var(--accent-secondary)', opacity: 0.12 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

export function FeaturesCarousel() {
  const { sectionTitle, features } = siteConfig.coreFeatures;

  if (!sectionTitle) return null;

  return (
    <SectionWrapper id="features">
      <SectionTitle {...sectionTitle} />
      <div className="mt-12 overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{ x: ['-5%', '-55%'] }}
          transition={{ duration: 40, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
        >
          {/* Duplicate for seamless loop */}
          {[...features, ...features, ...features].map((feature, i) => {
            const Icon = getIcon(feature.icon);
            return (
              <div
                key={`${feature.title}-${i}`}
                className="flex-shrink-0 w-[320px] rounded-2xl p-8 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-glass-bg)',
                  border: '1px solid var(--color-glass-border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: feature.bgColor || 'var(--color-glass-highlight)' }}
                >
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
