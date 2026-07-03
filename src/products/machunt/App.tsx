import { useEffect, useMemo } from 'react';
import { siteConfig } from './config/site.config';
import { getTheme, injectTheme } from './config/themes';
import ParticleField from './components/ParticleField';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { HeroSplit } from './components/HeroSplit';
import ProblemCompare from './components/ProblemCompare';
import { HowItWorksHorizontal, HowItWorksVerticalTimeline, HowItWorksCardStack } from './components/HowItWorksLayouts';
import CoreFeatures from './components/CoreFeatures';
import { FeaturesAlternating, FeaturesCarousel } from './components/FeaturesLayouts';
import LiveWorld from './components/LiveWorld';
import { DemoCodePreview, DemoStatCards, DemoBeforeAfter } from './components/DemoLayouts';
import Architecture from './components/Architecture';
import Roadmap from './components/Roadmap';
import { RoadmapKanban } from './components/RoadmapLayouts';
import Footer from './components/Footer';

const L = siteConfig.layout ?? { hero: 'centered', features: 'grid', howItWorks: 'horizontal', roadmap: 'timeline' };

export default function App() {
  const theme = useMemo(() => getTheme(siteConfig.theme), []);

  useEffect(() => {
    injectTheme(theme);

    document.title = siteConfig.meta.name;

    const fonts = theme.fonts;
    const family = [fonts.display, fonts.body]
      .filter(Boolean)
      .map((f) => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800`)
      .join('&');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${family}&display=swap`;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [theme]);

  return (
    <div className="relative bg-[var(--color-surface)] text-[var(--text-secondary)] min-h-screen overflow-x-hidden">
      <ParticleField
        hueMin={theme.particles.hueMin}
        hueMax={theme.particles.hueMax}
        connectionColor={theme.particles.connectionColor}
        countMultiplier={theme.particles.countMultiplier}
      />

      <Navbar config={siteConfig.navbar} logoText={siteConfig.meta.name} />

      {L.hero === 'split' ? (
        <HeroSplit />
      ) : (
        <Hero config={siteConfig.hero} theme={theme} />
      )}

      <ProblemCompare config={siteConfig.problemCompare} />

      {L.howItWorks === 'vertical-timeline' ? (
        <HowItWorksVerticalTimeline />
      ) : L.howItWorks === 'card-stack' ? (
        <HowItWorksCardStack />
      ) : (
        <HowItWorksHorizontal />
      )}

      {L.features === 'alternating' ? (
        <FeaturesAlternating />
      ) : L.features === 'carousel' ? (
        <FeaturesCarousel />
      ) : (
        <CoreFeatures config={siteConfig.coreFeatures} />
      )}

      {/* Live Demo — mode-driven */}
      {(() => {
        const mode = siteConfig.liveWorld.demoMode ?? 'conversation';
        if (mode === 'none') return null;
        if (mode === 'code-preview') return <DemoCodePreview config={siteConfig.liveWorld} />;
        if (mode === 'stat-cards') return <DemoStatCards config={siteConfig.liveWorld} />;
        if (mode === 'before-after') return <DemoBeforeAfter config={siteConfig.liveWorld} />;
        return <LiveWorld config={siteConfig.liveWorld} />;
      })()}
      <Architecture config={siteConfig.architecture} />

      {L.roadmap === 'kanban' ? (
        <RoadmapKanban />
      ) : (
        <Roadmap config={siteConfig.roadmap} />
      )}

      <Footer config={siteConfig.footer} />
    </div>
  );
}
