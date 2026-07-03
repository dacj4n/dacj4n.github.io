import { getIcon } from '../config/icon-map';
import SectionWrapper from './SectionWrapper';
import SectionTitle from './SectionTitle';
import GlowingCard from './GlowingCard';
import type { CoreFeaturesConfig } from '../config/config.types';

interface Props {
  config: CoreFeaturesConfig;
}

export default function CoreFeatures({ config }: Props) {
  return (
    <SectionWrapper id="features">
      <SectionTitle
        label={config.sectionTitle.label}
        title={config.sectionTitle.title}
        description={config.sectionTitle.description}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {config.features.map((feature, i) => {
          const Icon = getIcon(feature.icon);
          return (
            <GlowingCard key={i} delay={i * 0.08}>
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} border flex items-center justify-center mb-5`}>
                <Icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {feature.description}
              </p>
            </GlowingCard>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
