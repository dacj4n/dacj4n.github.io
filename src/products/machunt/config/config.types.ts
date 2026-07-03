import type { ThemeName } from './themes/types';

// ─── Shared ───
export interface CTA {
  text: string;
  href: string;
  icon: string;
  isExternal?: boolean;
}

export interface SectionTitleData {
  label: string;
  title: string;
  description: string;
}

// ─── Navbar ───
export interface NavLink {
  label: string;
  href: string;
}

// ─── Hero ───
export interface HeroConfig {
  badge: string;
  title: {
    prefix: string;
    highlight: string;
  };
  subtitle: string;
  description: string;
  cta: {
    primary: CTA;
    secondary: CTA;
  };
}

// ─── ProblemCompare ───
export interface CompareStep {
  icon: string;
  label: string;
  delay: number;
}

export interface ComparePanel {
  title: string;
  icon: string;
  steps: CompareStep[];
  bottomLabel: string;
  badge: string;
  agentNames?: string[];
}

export interface ProblemCompareConfig {
  sectionTitle: SectionTitleData;
  leftPanel: ComparePanel;
  rightPanel: ComparePanel;
}

// ─── HowItWorks ───
export interface Step {
  icon: string;
  number: string;
  title: string;
  description: string;
  color: string;
  border: string;
  iconColor: string;
}

export interface HowItWorksConfig {
  sectionTitle: SectionTitleData;
  steps: Step[];
}

// ─── CoreFeatures ───
export interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

export interface CoreFeaturesConfig {
  sectionTitle: SectionTitleData;
  features: Feature[];
}

// ─── Live Demo Modes ───
export type DemoMode = 'none' | 'conversation' | 'code-preview' | 'stat-cards' | 'before-after';

export interface Agent {
  name: string;
  status: string;
  color: string;
}

export interface Message {
  id: number;
  agent: string;
  emoji: string;
  text: string;
  delay: number;
}

export interface StatCard {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
}

export interface CodeSnippet {
  language: string;
  title: string;
  code: string;
}

export interface BeforeAfterItem {
  before: string;
  after: string;
}

export interface LiveWorldConfig {
  sectionTitle: SectionTitleData;
  /** Demo display mode — 'none' hides the entire section */
  demoMode: DemoMode;
  // conversation mode (existing)
  eventLabel?: string;
  eventTitle?: string;
  agents?: Agent[];
  conversation?: Message[];
  // code-preview mode
  codeSnippets?: CodeSnippet[];
  // stat-cards mode
  stats?: StatCard[];
  // before-after mode
  comparisons?: BeforeAfterItem[];
}

// ─── Architecture ───
export interface Layer {
  icon: string;
  label: string;
  description: string;
  color: string;
  iconColor: string;
  delay: number;
}

export interface ArchitectureConfig {
  sectionTitle: SectionTitleData;
  layers: Layer[];
  bottomText: string;
}

// ─── Roadmap ───
export interface Milestone {
  phase: string;
  title: string;
  description: string;
  status: 'done' | 'current' | 'upcoming';
  highlight: boolean;
}

export interface RoadmapConfig {
  sectionTitle: SectionTitleData;
  milestones: Milestone[];
}

// ─── Footer ───
export interface FooterConfig {
  brandName: string;
  description: string;
  linkGroups: Record<string, string[]>;
  quote: string;
  copyright: string;
}

// ─── Navbar ───
export interface NavbarConfig {
  logoText: string;
  navLinks: NavLink[];
  github: CTA;
}

// ─── Layout Variants ───
export type HeroLayout = 'centered' | 'split';

export type FeaturesLayout = 'grid' | 'alternating' | 'carousel';

export type HowItWorksLayout = 'horizontal' | 'vertical-timeline' | 'card-stack';

export type RoadmapLayout = 'timeline' | 'kanban';

export interface LayoutConfig {
  hero: HeroLayout;
  features: FeaturesLayout;
  howItWorks: HowItWorksLayout;
  roadmap: RoadmapLayout;
}

// ─── SiteConfig (root) ───
export interface SiteConfig {
  theme: ThemeName;
  layout?: LayoutConfig;
  meta: {
    name: string;
    titlePrefix: string;
    titleHighlight: string;
  };
  navbar: NavbarConfig;
  hero: HeroConfig;
  problemCompare: ProblemCompareConfig;
  howItWorks: HowItWorksConfig;
  coreFeatures: CoreFeaturesConfig;
  liveWorld: LiveWorldConfig;
  architecture: ArchitectureConfig;
  roadmap: RoadmapConfig;
  footer: FooterConfig;
}
