import {
  BrandLogo,
  FeaturedContentItem,
  NavCategory,
  NavLeafItem,
  NavSubcategory,
  PopularSearchLink,
  ResolvedCatalogRoute,
  SearchEntry,
} from '../models/navigation.models';

export const BRAND_LOGO: BrandLogo = {
  src: '/images/decaspark-emblem.png',
  alt: 'Decaspark emblem',
  href: '/',
  width: 44,
  height: 40,
};

export const NAVIGATION_CATEGORIES: readonly NavCategory[] = [
  {
    id: 'products',
    label: 'Products',
    subcategories: [
      {
        id: 'digital-systems',
        label: 'Digital Systems & Templates',
        items: [
          {
            label: 'Explore all digital products',
            href: '/products/digital',
            isOverview: true,
            tags: 'digital downloads store templates workspace notion',
          },
          {
            label: 'Notion & Operating Systems',
            href: '/products/digital/operating-systems',
            tags: 'notion workspace second brain company os productivity',
          },
          {
            label: 'Project & Sprint Frameworks',
            href: '/products/digital/sprint-frameworks',
            tags: 'agile roadmap planning tracker delivery templates',
          },
          {
            label: 'Financial & Ops Calculators',
            href: '/products/digital/ops-calculators',
            tags: 'spreadsheets finance runway pricing models',
          },
          {
            label: 'Client Portal Blueprints',
            href: '/products/digital/client-portals',
            tags: 'agency onboarding delivery dashboard crm',
          },
          {
            label: 'Knowledge Base Kits',
            href: '/products/digital/knowledge-bases',
            tags: 'wiki handbook sop documentation templates',
          },
        ],
      },
      {
        id: 'design-creator-assets',
        label: 'Design & Creator Assets',
        items: [
          {
            label: 'Explore design & creator kits',
            href: '/products/design-assets',
            isOverview: true,
            tags: 'figma design ui kits creative assets',
          },
          {
            label: 'UI Component Libraries',
            href: '/products/design-assets/ui-libraries',
            tags: 'figma react tokens design system components',
          },
          {
            label: 'Brand Identity & Deck Systems',
            href: '/products/design-assets/brand-decks',
            tags: 'pitch decks slides keynote presentation guidelines',
          },
          {
            label: 'Editorial & Social Layout Packs',
            href: '/products/design-assets/editorial-packs',
            tags: 'content creation social media carousels thumbnails',
          },
          {
            label: 'Iconography & Motion Presets',
            href: '/products/design-assets/motion-presets',
            tags: 'icons svg video luts motion templates',
          },
        ],
      },
      {
        id: 'software-ai-packs',
        label: 'Software, Scripts & AI Packs',
        items: [
          {
            label: 'Explore software & toolkits',
            href: '/products/software',
            isOverview: true,
            tags: 'code scripts saas micro tools developer',
          },
          {
            label: 'Workflow & API Connectors',
            href: '/products/software/api-connectors',
            tags: 'webhooks integrations n8n make zapier scripts',
          },
          {
            label: 'Prompt & Agent Libraries',
            href: '/products/software/agent-libraries',
            tags: 'ai prompts llm agents workflows',
          },
          {
            label: 'CLI & Developer Utilities',
            href: '/products/software/developer-utilities',
            tags: 'command line boilerplate starter kits engineering',
          },
          {
            label: 'Browser & Workspace Extensions',
            href: '/products/software/workspace-extensions',
            tags: 'plugins productivity extensions apps',
          },
        ],
      },
      {
        id: 'books-print-editions',
        label: 'Books & Print Editions',
        items: [
          {
            label: 'Browse all books & print',
            href: '/products/books',
            isOverview: true,
            tags: 'self made books physical print publishing hardcover paperback',
          },
          {
            label: 'Authored Technical & Strategy Books',
            href: '/products/books/strategy-books',
            tags: 'self-made books authored monographs engineering leadership',
          },
          {
            label: 'Team Operations Field Guides',
            href: '/products/books/field-guides',
            tags: 'physical books pocket guides handbooks operators',
          },
          {
            label: 'Structured Workbooks & Manuals',
            href: '/products/books/workbooks',
            tags: 'print workbooks exercises tactical manuals',
          },
          {
            label: 'Collector Hardcover Editions',
            href: '/products/books/hardcover-editions',
            tags: 'limited print clothbound books decaspark press',
          },
          {
            label: 'Digital + Print Bundles',
            href: '/products/books/bundles',
            tags: 'ebook pdf epub hardcover bundle',
          },
        ],
      },
      {
        id: 'physical-studio-goods',
        label: 'Physical Studio Goods',
        items: [
          {
            label: 'Explore physical goods',
            href: '/products/physical-goods',
            isOverview: true,
            tags: 'physical products stationery hardware desk gear merch',
          },
          {
            label: 'Dot-Grid Journals & Planners',
            href: '/products/physical-goods/journals-planners',
            tags: 'notebooks paper quarterly planner analog',
          },
          {
            label: 'Architecture & Strategy Card Decks',
            href: '/products/physical-goods/strategy-decks',
            tags: 'physical workshop cards facilitation decks',
          },
          {
            label: 'Desk Mats & Reference Prints',
            href: '/products/physical-goods/desk-goods',
            tags: 'studio desk accessories posters prints',
          },
          {
            label: 'Team Onboarding Kits',
            href: '/products/physical-goods/onboarding-kits',
            tags: 'physical welcome boxes books stationery',
          },
        ],
      },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    subcategories: [
      {
        id: 'content-creation',
        label: 'Content Creation & Editorial',
        items: [
          {
            label: 'Content studio overview',
            href: '/services/content-creation',
            isOverview: true,
            tags: 'content creation agency writing editorial marketing',
          },
          {
            label: 'Technical & Long-Form Writing',
            href: '/services/content-creation/technical-writing',
            tags: 'articles whitepapers deep dives engineering blogs',
          },
          {
            label: 'Executive Thought Leadership',
            href: '/services/content-creation/thought-leadership',
            tags: 'ghostwriting essays founder communication',
          },
          {
            label: 'Product Launch Narratives',
            href: '/services/content-creation/launch-narratives',
            tags: 'messaging positioning announcements campaigns',
          },
          {
            label: 'Documentation & Playbook Authorship',
            href: '/services/content-creation/documentation',
            tags: 'developer docs internal playbooks manuals',
          },
        ],
      },
      {
        id: 'creative-production',
        label: 'Video, Brand & Creative Production',
        items: [
          {
            label: 'Creative production overview',
            href: '/services/creative-production',
            isOverview: true,
            tags: 'video production motion design brand studio',
          },
          {
            label: 'Product Walkthroughs & Demos',
            href: '/services/creative-production/product-demos',
            tags: 'launch videos explainers screencasts motion',
          },
          {
            label: 'Multi-Channel Video Systems',
            href: '/services/creative-production/video-systems',
            tags: 'youtube short-form social video series editing',
          },
          {
            label: 'Visual Identity & Design Systems',
            href: '/services/creative-production/design-systems',
            tags: 'branding typography web design guidelines',
          },
          {
            label: 'Keynote & Pitch Deck Design',
            href: '/services/creative-production/pitch-decks',
            tags: 'investor decks conference presentations slides',
          },
        ],
      },
      {
        id: 'workflow-automation',
        label: 'Workflow & Operations Automation',
        items: [
          {
            label: 'Automation engineering overview',
            href: '/services/automation',
            isOverview: true,
            tags: 'automation workflows operations efficiency integration',
          },
          {
            label: 'End-to-End Process Automation',
            href: '/services/automation/process-automation',
            tags: 'eliminate manual tasks ops orchestration',
          },
          {
            label: 'CRM, Billing & Revenue Pipelines',
            href: '/services/automation/revenue-pipelines',
            tags: 'revops sales onboarding invoicing automation',
          },
          {
            label: 'Cross-Tool Sync & Webhooks',
            href: '/services/automation/integrations',
            tags: 'api sync slack linear notion hubspot supabase',
          },
          {
            label: 'Reporting & Executive Dashboards',
            href: '/services/automation/dashboards',
            tags: 'automated kpi metrics analytics alerts',
          },
        ],
      },
      {
        id: 'ai-agents-tooling',
        label: 'AI Agents & Custom Tooling',
        items: [
          {
            label: 'AI systems overview',
            href: '/services/ai-systems',
            isOverview: true,
            tags: 'artificial intelligence agents custom llm automation',
          },
          {
            label: 'Custom Internal AI Assistants',
            href: '/services/ai-systems/internal-assistants',
            tags: 'team copilots support triage slack bots',
          },
          {
            label: 'Automated Content & Research Pipelines',
            href: '/services/ai-systems/content-pipelines',
            tags: 'editorial workflows synthesis enrichment',
          },
          {
            label: 'Knowledge Retrieval (RAG) Systems',
            href: '/services/ai-systems/knowledge-retrieval',
            tags: 'company search semantic docs indexing',
          },
          {
            label: 'Bespoke Internal Apps & Portals',
            href: '/services/ai-systems/internal-apps',
            tags: 'custom software admin panels operational tools',
          },
        ],
      },
    ],
  },
  {
    id: 'for-teams',
    label: 'For Teams',
    subcategories: [
      {
        id: 'team-enablement',
        label: 'Team Enablement & Advisory',
        items: [
          {
            label: 'How we help teams',
            href: '/teams/enablement',
            isOverview: true,
            tags: 'helping teams consulting advisory coaching productivity',
          },
          {
            label: 'Operating Cadence & Workflow Audits',
            href: '/teams/enablement/workflow-audits',
            tags: 'diagnostics bottlenecks execution velocity',
          },
          {
            label: 'Async Collaboration Architecture',
            href: '/teams/enablement/async-collaboration',
            tags: 'remote distributed teams communication rituals',
          },
          {
            label: 'SOP & Documentation Sprints',
            href: '/teams/enablement/sop-sprints',
            tags: 'knowledge transfer institutional memory playbooks',
          },
          {
            label: 'Toolstack Consolidation',
            href: '/teams/enablement/toolstack-consolidation',
            tags: 'software audit cost reduction migration',
          },
        ],
      },
      {
        id: 'workshops-training',
        label: 'Workshops & Training',
        items: [
          {
            label: 'Explore workshops & cohorts',
            href: '/teams/training',
            isOverview: true,
            tags: 'team training live workshops upskilling',
          },
          {
            label: 'AI & Automation Bootcamp for Teams',
            href: '/teams/training/automation-bootcamp',
            tags: 'hands-on ai adoption workflow building',
          },
          {
            label: 'Content Engine Workshop',
            href: '/teams/training/content-engine',
            tags: 'editorial systems team publishing training',
          },
          {
            label: 'Systems Thinking for Operators',
            href: '/teams/training/systems-thinking',
            tags: 'operations architecture leadership cohort',
          },
          {
            label: 'Custom Onsite & Virtual Briefings',
            href: '/teams/training/executive-briefings',
            tags: 'leadership offsites seminars strategy sessions',
          },
        ],
      },
      {
        id: 'solutions-by-function',
        label: 'Solutions by Function',
        items: [
          {
            label: 'Product & Engineering Teams',
            href: '/teams/functions/product-engineering',
            tags: 'specs release workflows developer velocity',
          },
          {
            label: 'Operations & Chief of Staff',
            href: '/teams/functions/operations',
            tags: 'company rhythm okrs automation ops',
          },
          {
            label: 'Marketing, Media & Content Teams',
            href: '/teams/functions/marketing-content',
            tags: 'editorial calendars production pipelines assets',
          },
          {
            label: 'Founders & Lean Leadership',
            href: '/teams/functions/founders',
            tags: 'scaling startups leverage operating systems',
          },
          {
            label: 'Agencies & Consultancies',
            href: '/teams/functions/agencies',
            tags: 'client delivery repeatable engagements margin',
          },
        ],
      },
      {
        id: 'enterprise-licensing',
        label: 'Enterprise & Volume Licensing',
        items: [
          {
            label: 'Team & Organization Licenses',
            href: '/teams/licensing',
            isOverview: true,
            tags: 'seat licenses unlimited digital access',
          },
          {
            label: 'Bulk Physical Book & Kit Orders',
            href: '/teams/licensing/bulk-editions',
            tags: 'wholesale books offsites corporate gifting',
          },
          {
            label: 'Dedicated Retainer Partnerships',
            href: '/teams/licensing/retainers',
            tags: 'ongoing automation content advisory support',
          },
        ],
      },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    subcategories: [
      {
        id: 'guides-frameworks',
        label: 'Guides & Frameworks',
        items: [
          {
            label: 'Resource library',
            href: '/resources',
            isOverview: true,
            tags: 'free guides frameworks articles insights',
          },
          {
            label: 'Automation Architecture Blueprints',
            href: '/resources/automation-blueprints',
            tags: 'reference diagrams workflows technical guides',
          },
          {
            label: 'Content Operations Handbook',
            href: '/resources/content-operations',
            tags: 'editorial process publishing framework',
          },
          {
            label: 'Team Productivity Benchmarks',
            href: '/resources/productivity-benchmarks',
            tags: 'research report metrics operations',
          },
        ],
      },
      {
        id: 'journal-publications',
        label: 'Journal & Publications',
        items: [
          {
            label: 'Decaspark Journal',
            href: '/resources/journal',
            tags: 'essays blog articles updates',
          },
          {
            label: 'Book Excerpts & Sample Chapters',
            href: '/resources/sample-chapters',
            tags: 'free chapters reading preview decaspark press',
          },
          {
            label: 'Release Notes & Product Updates',
            href: '/resources/changelog',
            tags: 'new releases changelog templates tools',
          },
          {
            label: 'Newsletter & Briefings',
            href: '/resources/newsletter',
            tags: 'weekly dispatch insights operators',
          },
        ],
      },
      {
        id: 'case-studies',
        label: 'Case Studies',
        items: [
          {
            label: 'Client & Team Outcomes',
            href: '/resources/case-studies',
            isOverview: true,
            tags: 'results customer stories impact roi',
          },
          {
            label: 'Scaling Operations with Automation',
            href: '/resources/case-studies/operations-automation',
            tags: 'hours saved workflow transformation',
          },
          {
            label: 'Building B2B Content Engines',
            href: '/resources/case-studies/content-engines',
            tags: 'organic growth editorial production case study',
          },
        ],
      },
      {
        id: 'customer-support',
        label: 'Customer Support',
        items: [
          {
            label: 'Help Center & Documentation',
            href: '/support',
            tags: 'faq help docs customer service',
          },
          {
            label: 'Orders, Shipping & Returns',
            href: '/support/orders-shipping',
            tags: 'physical books delivery tracking international shipping',
          },
          {
            label: 'Digital License & Download Access',
            href: '/support/digital-access',
            tags: 'account downloads invoices license keys',
          },
          {
            label: 'Open Source on GitHub',
            href: 'https://github.com/Decaspark',
            external: true,
            tags: 'github repositories code open source decaspark',
          },
        ],
      },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    subcategories: [
      {
        id: 'about-decaspark',
        label: 'About Decaspark',
        items: [
          {
            label: 'Our Mission & Operating Principles',
            href: '/company/about',
            isOverview: true,
            tags: 'about decaspark story vision values',
          },
          {
            label: 'Leadership & Studio Craft',
            href: '/company/leadership',
            tags: 'team founders philosophy standards',
          },
          {
            label: 'Decaspark Press (Publishing Imprint)',
            href: '/company/press-imprint',
            tags: 'self made books publishing house print craft',
          },
          {
            label: 'Sustainability & Print Quality',
            href: '/company/print-craft',
            tags: 'archival paper binding materials physical goods',
          },
        ],
      },
      {
        id: 'work-with-us',
        label: 'Work With Us',
        items: [
          {
            label: 'Book a Discovery Call',
            href: '/company/contact',
            tags: 'contact consultation inquiry sales',
          },
          {
            label: 'Request a Custom Proposal',
            href: '/company/proposals',
            tags: 'enterprise automation content engagement quote',
          },
          {
            label: 'Partner & Affiliate Program',
            href: '/company/partners',
            tags: 'creators referrals partnerships',
          },
          {
            label: 'Careers at Decaspark',
            href: '/company/careers',
            tags: 'jobs hiring writers engineers designers',
          },
        ],
      },
      {
        id: 'press-legal',
        label: 'Press & Legal',
        items: [
          {
            label: 'Brand Assets & Media Kit',
            href: '/company/media-kit',
            tags: 'logo press kit guidelines',
          },
          {
            label: 'Terms of Service & Licensing',
            href: '/company/terms',
            tags: 'commercial license legal terms',
          },
          {
            label: 'Privacy & Security',
            href: '/company/privacy',
            tags: 'data protection security compliance',
          },
        ],
      },
    ],
  },
];

export const SEARCH_PROMPT_HEADING = 'What are you looking for?';

export const POPULAR_SEARCH_LINKS: readonly PopularSearchLink[] = [
  {
    label: 'Digital Products & Systems',
    href: '/products/digital',
  },
  {
    label: 'Self-Made Books & Print Editions',
    href: '/products/books',
  },
  {
    label: 'Workflow & AI Automation',
    href: '/services/automation',
  },
  {
    label: 'Content Creation Studio',
    href: '/services/content-creation',
  },
  {
    label: 'Team Enablement & Workshops',
    href: '/teams/enablement',
  },
  {
    label: 'Software, Scripts & Agent Packs',
    href: '/products/software',
  },
  {
    label: 'Journals, Decks & Desk Goods',
    href: '/products/physical-goods',
  },
  {
    label: 'Team & Volume Licensing',
    href: '/teams/licensing',
  },
];

export const FEATURED_CONTENT_HEADING = 'Featured from Decaspark';

export const FEATURED_CONTENT_ITEMS: readonly FeaturedContentItem[] = [
  {
    title: 'The Systems Playbook: Hardcover & Digital Edition',
    description:
      'An authored manual from Decaspark Press on designing resilient team workflows, documentation, and automation that compound.',
    href: '/products/books/strategy-books',
  },
  {
    title: 'End-to-End Workflow & AI Automation for Modern Teams',
    description:
      'Eliminate repetitive handoffs across CRM, knowledge bases, and internal tools with custom pipelines engineered by Decaspark.',
    href: '/services/automation',
  },
  {
    title: 'Equip Your Organization with Ready-to-Deploy Systems & Content',
    description:
      'Combine Decaspark digital templates, physical field guides, and dedicated studio production to help your team ship faster.',
    href: '/teams/enablement',
  },
];

function buildSearchIndex(): SearchEntry[] {
  const seen = new Set<string>();
  const entries: SearchEntry[] = [];

  for (const cat of NAVIGATION_CATEGORIES) {
    for (const sub of cat.subcategories) {
      for (const item of sub.items) {
        if (seen.has(item.href)) continue;
        seen.add(item.href);
        entries.push({
          id: `${cat.id}-${sub.id}-${entries.length}`,
          title: item.label,
          href: item.href,
          section: `${cat.label} · ${sub.label}`,
          external: item.external,
          keywords: `${item.label} ${sub.label} ${cat.label} ${item.tags ?? ''}`.toLowerCase(),
        });
      }
    }
  }

  for (const feat of FEATURED_CONTENT_ITEMS) {
    if (seen.has(feat.href)) continue;
    seen.add(feat.href);
    entries.push({
      id: `featured-${entries.length}`,
      title: feat.title,
      href: feat.href,
      section: FEATURED_CONTENT_HEADING,
      external: feat.external,
      keywords: `${feat.title} ${feat.description}`.toLowerCase(),
    });
  }

  return entries;
}

export const SEARCH_INDEX: readonly SearchEntry[] = buildSearchIndex();

const TOP_LEVEL_PILLAR_BY_SEGMENT: Readonly<Record<string, string>> = {
  products: 'products',
  services: 'services',
  teams: 'for-teams',
  resources: 'resources',
  support: 'resources',
  company: 'company',
};

const PILLAR_DESCRIPTIONS: Readonly<Record<string, string>> = {
  products:
    'Digital operating systems, design kits, developer toolkits, authored books, and physical studio goods crafted by Decaspark.',
  services:
    'Editorial authorship, creative video production, workflow automation engineering, and custom AI systems for modern organizations.',
  'for-teams':
    'Advisory, live workshops, role-specific operating systems, and organization-wide volume licensing.',
  resources:
    'Reference architectures, Decaspark Journal publications, book sample chapters, client outcomes, and customer support.',
  company:
    'Decaspark operating principles, publishing imprint craft, partnership inquiries, and legal documentation.',
};

function normalizePath(rawPath: string): string {
  const withoutQuery = rawPath.split('?')[0]?.split('#')[0] ?? '/';
  if (!withoutQuery || withoutQuery === '/') return '/';
  const trimmed = withoutQuery.endsWith('/') ? withoutQuery.slice(0, -1) : withoutQuery;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function resolveCatalogRoute(rawPath: string): ResolvedCatalogRoute | null {
  const normalized = normalizePath(rawPath);
  if (normalized === '/' || normalized === '/search') {
    return null;
  }

  // 1. Exact match against any internal L3 item across all categories
  for (const category of NAVIGATION_CATEGORIES) {
    for (const subcategory of category.subcategories) {
      const matchedItem: NavLeafItem | undefined = subcategory.items.find(
        (item) => !item.external && normalizePath(item.href) === normalized,
      );
      if (matchedItem) {
        const isOverview = Boolean(matchedItem.isOverview);
        return {
          path: normalized,
          category,
          activeSubcategory: subcategory,
          activeItem: matchedItem,
          heading: isOverview ? subcategory.label : matchedItem.label,
          eyebrow: isOverview ? category.label : `${category.label} · ${subcategory.label}`,
          description: isOverview
            ? `Explore ${subcategory.label.toLowerCase()} within Decaspark ${category.label}.`
            : `${matchedItem.label}, part of Decaspark ${subcategory.label}.`,
        };
      }
    }
  }

  // 2. Top-level pillar directory match (/products, /services, /teams, /resources, /company)
  const segments = normalized.slice(1).split('/');
  if (segments.length === 1) {
    const seg = segments[0];
    if (seg) {
      const categoryId = TOP_LEVEL_PILLAR_BY_SEGMENT[seg];
      const category: NavCategory | undefined = NAVIGATION_CATEGORIES.find(
        (cat) => cat.id === categoryId,
      );
      if (category) {
        const sub: NavSubcategory | null =
          seg === 'support'
            ? (category.subcategories.find((s) => s.id === 'customer-support') ?? null)
            : null;
        return {
          path: normalized,
          category,
          activeSubcategory: sub,
          activeItem: null,
          heading: sub ? sub.label : category.label,
          eyebrow: 'Decaspark',
          description: PILLAR_DESCRIPTIONS[category.id] ?? `Explore Decaspark ${category.label}.`,
        };
      }
    }
  }

  return null;
}

export function getAllPublicCatalogPaths(): string[] {
  const paths = new Set<string>(['/products', '/services', '/teams', '/resources', '/company']);
  for (const cat of NAVIGATION_CATEGORIES) {
    for (const sub of cat.subcategories) {
      for (const item of sub.items) {
        if (!item.external && item.href.startsWith('/')) {
          paths.add(normalizePath(item.href));
        }
      }
    }
  }
  return Array.from(paths).sort();
}
