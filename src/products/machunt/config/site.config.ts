import type { SiteConfig } from './config.types';

export const siteConfig: SiteConfig = {
  theme: 'linear',

  layout: {
    hero: 'centered',
    features: 'grid',
    howItWorks: 'horizontal',
    roadmap: 'timeline',
  },

  meta: {
    name: 'MacHunt',
    titlePrefix: 'Mac',
    titleHighlight: 'Hunt',
  },

  navbar: {
    logoText: 'MacHunt',
    navLinks: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Features', href: '#features' },
      { label: 'Live Demo', href: '#live-world' },
      { label: 'Architecture', href: '#architecture' },
      { label: 'Roadmap', href: '#roadmap' },
    ],
    github: { text: 'GitHub', href: 'https://github.com/dacj4n/MacHunt', icon: 'ExternalLink' },
  },

  hero: {
    badge: 'Fully Local · Open Source',
    title: { prefix: 'Mac', highlight: 'Hunt' },
    subtitle: 'Like Spotlight, But Yours.',
    description:
      'Scan your entire filesystem into a local SQLite FTS5 index. CLI searches finish in under 5ms. Real-time FSEvents updates keep the index live. No cloud, no telemetry — your data never leaves your Mac.',
    cta: {
      primary: { text: 'View on GitHub', href: 'https://github.com/dacj4n/MacHunt', icon: 'ExternalLink', isExternal: true },
      secondary: { text: 'See How It Works', href: '#how-it-works', icon: 'ArrowRight' },
    },
  },

  problemCompare: {
    sectionTitle: {
      label: 'The Difference',
      title: 'Beyond Spotlight',
      description:
        "Spotlight is a black box. MacHunt gives you a fast, open, hackable search engine that runs entirely on your machine — with a powerful CLI and a native GUI.",
    },
    leftPanel: {
      title: 'Spotlight / mdfind',
      icon: 'Bot',
      steps: [
        { icon: 'Clock', label: '50–200ms+ per query', delay: 0 },
        { icon: 'Lock', label: 'Proprietary index format', delay: 0.1 },
        { icon: 'MessageSquare', label: 'No fuzzy search, no wildcards', delay: 0.2 },
      ],
      bottomLabel: 'Closed, opaque, limited',
      badge: 'Black Box',
    },
    rightPanel: {
      title: 'MacHunt',
      icon: 'Zap',
      steps: [
        { icon: 'Zap', label: '<5ms CLI search (FTS5 trigram)', delay: 0.3 },
        { icon: 'Code2', label: 'Open SQLite FTS5 — query it yourself', delay: 0.4 },
        { icon: 'Sparkles', label: 'Fuzzy, wildcard, regex, case toggle', delay: 0.5 },
      ],
      bottomLabel: '',
      badge: 'Fast, Open, Hackable',
      agentNames: ['Rust', 'SQLite', 'React', 'Tauri'],
    },
  },

  howItWorks: {
    sectionTitle: {
      label: 'How It Works',
      title: 'From Disk to Result in Milliseconds',
      description: 'Four steps — all local, all fast, no network involved.',
    },
    steps: [
      {
        icon: 'Globe', number: '01', title: 'Build the Index',
        description: 'WalkDir scans your entire filesystem in parallel via crossbeam channels. Every file and folder is inserted into a local SQLite FTS5 database with trigram tokenization. ~10 seconds for 3 million files.',
        color: 'from-purple-500/20 to-blue-500/20', border: 'border-purple-500/20', iconColor: 'text-purple-400',
      },
      {
        icon: 'Zap', number: '02', title: 'Search Instantly',
        description: 'FTS5 trigram MATCH completes in under 5ms. Substring, wildcard (*.rs), regex, fuzzy (Levenshtein), case-sensitive — all modes available from both CLI and GUI. Short queries fall back to LIKE for accuracy.',
        color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20', iconColor: 'text-blue-400',
      },
      {
        icon: 'Eye', number: '03', title: 'Watch Live Changes',
        description: 'Raw FSEvents FFI (CoreServices) streams file creation, modification, deletion, and rename events. The index updates incrementally and persists the last EventID — resume from where you left off after every restart.',
        color: 'from-cyan-500/20 to-emerald-500/20', border: 'border-cyan-500/20', iconColor: 'text-cyan-400',
      },
      {
        icon: 'Monitor', number: '04', title: 'Explore with Native GUI',
        description: 'A Tauri 2 + React desktop app with neomorphic design. Category tabs, sortable columns, Quick Look preview (space bar), right-click context menu, pinned favorites with localStorage persistence, and global hotkey support.',
        color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/20', iconColor: 'text-emerald-400',
      },
    ],
  },

  coreFeatures: {
    sectionTitle: {
      label: 'Core Features',
      title: 'Everything You Need to Find Anything',
      description: 'A complete local search toolkit. CLI power users and GUI enthusiasts both feel at home.',
    },
    features: [
      {
        icon: 'Zap', title: 'Sub-5ms Search',
        description: 'SQLite FTS5 with trigram tokenizer. CLI queries return in under 5ms even across millions of files. JSON output for scripting.',
        color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20',
      },
      {
        icon: 'Sparkles', title: 'Fuzzy & Wildcard Modes',
        description: 'Levenshtein edit-distance for typo-tolerant search. Full glob wildcards (*, **, ?, {a,b}) and regex patterns. Case-sensitive toggle.',
        color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20',
      },
      {
        icon: 'Radio', title: 'Live FSEvents Updates',
        description: 'Incremental index updates via macOS FSEvents. New files, renames, and deletions sync in real-time. Resumes from last EventID across restarts.',
        color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      },
      {
        icon: 'Star', title: 'Pinned Favorites',
        description: 'Star any result to pin it. Pinned items persist in localStorage across restarts. Dedicated Pinned tab with full sort, resize, and Quick Look.',
        color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      },
      {
        icon: 'Monitor', title: 'Native macOS GUI',
        description: 'Tauri 2 + React with neomorphic 3D design. 8 category tabs, draggable column splitters, keyboard navigation, right-click context menu, global hotkey.',
        color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20',
      },
      {
        icon: 'Shield', title: '100% Local Privacy',
        description: 'No HTTP server, no cloud services, no telemetry. The search engine runs entirely on your machine. Your file paths never leave your disk.',
        color: 'text-pink-400', bgColor: 'bg-pink-500/10 border-pink-500/20',
      },
    ],
  },

  liveWorld: {
    sectionTitle: {
      label: 'Live Demo',
      title: 'See the CLI in Action',
      description: 'Real MacHunt commands you can run right now. Fast, flexible, and stays on your machine.',
    },
    demoMode: 'code-preview',

    eventLabel: 'Terminal',
    eventTitle: '$ machunt search "budget"',
    agents: [
      { name: 'CLI', status: 'ready', color: 'text-purple-400' },
      { name: 'FTS5 Engine', status: 'indexed', color: 'text-emerald-400' },
      { name: 'FSEvents', status: 'watching', color: 'text-blue-400' },
      { name: 'GUI', status: 'running', color: 'text-amber-400' },
      { name: 'Index DB', status: '3.2M files', color: 'text-pink-400' },
      { name: 'Watcher', status: 'live', color: 'text-cyan-400' },
    ],
    conversation: [
      { id: 1, agent: 'CLI', emoji: '⚡', text: '$ machunt search "budget" — searching 3.2M files...', delay: 0 },
      { id: 2, agent: 'FTS5 Engine', emoji: '🔍', text: 'FTS5 trigram MATCH: 47 results in 3.2ms. Substring mode, case-insensitive.', delay: 2 },
      { id: 3, agent: 'CLI', emoji: '📄', text: '1. ~/Documents/Budget_2026.xlsx (1.2 MB)\n2. ~/Projects/budget-app/src/main.rs (4.5 KB)\n3. ~/Downloads/budget_template.pdf (856 KB)', delay: 4 },
      { id: 4, agent: 'CLI', emoji: '🎯', text: '$ machunt search -p "*.rs" — wildcard mode, 12,431 results in 4.1ms', delay: 6 },
      { id: 5, agent: 'CLI', emoji: '🔎', text: '$ machunt search -F "redme" — fuzzy mode, matched "README.md", "readme.txt"...', delay: 8 },
      { id: 6, agent: 'FSEvents', emoji: '🔄', text: 'FSEvents: detected 3 new files, 1 rename, 2 deletes. Index updated incrementally.', delay: 10 },
      { id: 7, agent: 'GUI', emoji: '🖥️', text: 'GUI: Quick Look preview (space bar), category tabs, pinned favorites synced.', delay: 12 },
      { id: 8, agent: 'CLI', emoji: '📊', text: '$ machunt search --json "invoice" | jq . → JSON output for scripting & automation.', delay: 14 },
    ],

    codeSnippets: [
      {
        language: 'bash',
        title: 'build-index',
        code: '# Build the search index (~10s for 3M files)\nmachunt build\n\n# Rebuild from scratch\nmachunt build --rebuild\n\n# Index specific directory only\nmachunt build -p ~/Projects',
      },
      {
        language: 'bash',
        title: 'search-modes',
        code: '# Substring search (default, case-insensitive)\nmachunt search "budget"\n\n# Wildcard pattern\nmachunt search -p "*.rs"\n\n# Fuzzy / typo-tolerant\nmachunt search -F "redme"\n\n# Case-sensitive\nmachunt search -c "Makefile"\n\n# JSON output for scripting\nmachunt search --json "invoice" | jq .',
      },
      {
        language: 'bash',
        title: 'live-watcher',
        code: '# Start FSEvents watcher with interactive search\nmachunt watch\n\n# Optimize database\nmachunt optimize\n\n# Vacuum to reclaim disk space\nmachunt optimize --vacuum',
      },
    ],

    stats: [
      { label: 'Search Latency', value: '<5', suffix: 'ms' },
      { label: 'Files Indexed', value: '3.2', suffix: 'M' },
      { label: 'Index Build Time', value: '~10', suffix: 's' },
      { label: 'Network Calls', value: '0', prefix: '' },
    ],

    comparisons: [
      {
        before: 'Spotlight: type query, wait 100-200ms, get results from a proprietary black-box index you cannot inspect or customize.',
        after: 'MacHunt: type `machunt search "query"`, get results in <5ms from an open SQLite FTS5 database you can query directly.',
      },
      {
        before: 'Finder search: no regex, no fuzzy matching, no wildcards. Hope the filename exactly matches what you typed.',
        after: 'MacHunt: wildcard patterns (*.rs), fuzzy Levenshtein matching, full regex, case-sensitive toggle — all in one tool.',
      },
      {
        before: 'Cloud search tools: your file paths and search queries sent to remote servers. Privacy policy may change at any time.',
        after: 'MacHunt: everything runs locally. No HTTP server, no telemetry, no cloud. The index is a SQLite file on your disk.',
      },
    ],
  },

  architecture: {
    sectionTitle: {
      label: 'Architecture',
      title: 'Clean, Local-First Stack',
      description: 'Every layer runs on your Mac. No server, no cloud — just Rust, SQLite, and macOS native APIs.',
    },
    layers: [
      {
        icon: 'Monitor', label: 'React + Tauri 2 GUI', description: 'Neomorphic design, category tabs, Quick Look, context menu, global hotkey',
        color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20', iconColor: 'text-blue-400', delay: 0,
      },
      {
        icon: 'Server', label: 'Rust Core Engine', description: 'Build, search, watch orchestration. Shared by CLI and GUI via Tauri commands.',
        color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/20', iconColor: 'text-emerald-400', delay: 0.2,
      },
      {
        icon: 'Database', label: 'SQLite FTS5 (Trigram)', description: 'Full-text search index. WAL mode for concurrent reads. <5ms MATCH queries.',
        color: 'from-purple-500/20 to-pink-500/20 border-purple-500/20', iconColor: 'text-purple-400', delay: 0.4,
      },
      {
        icon: 'Cpu', label: 'macOS FSEvents FFI', description: 'CoreServices file system events. Incremental updates. EventID persistence across restarts.',
        color: 'from-amber-500/20 to-orange-500/20 border-amber-500/20', iconColor: 'text-amber-400', delay: 0.6,
      },
    ],
    bottomText: 'Zero network calls — everything runs on your machine',
  },

  roadmap: {
    sectionTitle: {
      label: 'Roadmap',
      title: 'The Path to v1.0',
      description: "MacHunt is already fast and stable. Here's what's coming next on the journey to a 1.0 release.",
    },
    milestones: [
      {
        phase: 'Now', title: 'MacHunt v0.5.3',
        description: 'FTS5 trigram search, wildcard/regex/fuzzy modes, FSEvents live watcher, Tauri 2 GUI with neomorphic design, pinned favorites, i18n (中文/English), global hotkey, login items.',
        status: 'done', highlight: true,
      },
      {
        phase: 'v0.6', title: 'Content Search & Preview',
        description: 'Full-text content indexing for common file types (PDF, docx, txt, source code). Inline preview panel in GUI. Search within file contents.',
        status: 'current', highlight: false,
      },
      {
        phase: 'v0.7', title: 'Plugin System',
        description: 'Extensible search filters and result actions. Community plugins for custom file type handlers, export formats, and integration with other tools.',
        status: 'upcoming', highlight: false,
      },
      {
        phase: 'v0.8', title: 'Advanced Filters & Smart Search',
        description: 'Natural language queries ("PDFs modified this week"), saved search presets, file metadata indexing (EXIF, codec info, code symbols), search history.',
        status: 'upcoming', highlight: false,
      },
      {
        phase: 'v1.0', title: 'Stable Release',
        description: 'Signed & notarized macOS app. Auto-update infrastructure. Comprehensive test suite (80%+ coverage). Full documentation site. Homebrew cask distribution.',
        status: 'upcoming', highlight: false,
      },
    ],
  },

  footer: {
    brandName: 'MacHunt',
    description:
      'A fully local macOS file search tool with CLI and native GUI. Built with Rust, Tauri, React, and SQLite. Open source under MIT license.',
    linkGroups: {
      Product: ['Features', 'Architecture', 'Roadmap', 'Changelog'],
      Resources: ['Documentation', 'CLI Reference', 'Install Guide', 'Build from Source'],
      Community: ['GitHub', 'Issues', 'Discussions', 'MIT License'],
      Compare: ['vs Spotlight', 'vs Raycast', 'vs uTools', 'vs Alfred'],
    },
    quote: 'Your files. Your machine. Your search.',
    copyright: 'MacHunt. Open source, local-first, privacy-respecting macOS search.',
  },
};
