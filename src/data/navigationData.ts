export interface NavLeafItem {
  label: string;
  href: string;
  external?: boolean;
  isOverview?: boolean;
}

export interface NavSubcategory {
  id: string;
  label: string;
  items: NavLeafItem[];
}

export interface NavCategory {
  id: string;
  label: string;
  subcategories: NavSubcategory[];
}

export interface PopularSearchLink {
  label: string;
  href: string;
}

export interface FeaturedContentItem {
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

export interface SearchEntry {
  id: string;
  title: string;
  href: string;
  section: string;
  external?: boolean;
  keywords: string;
}

export const BRAND_LOGO = {
  src: '/images/decaspark-emblem.png',
  alt: 'Decaspark emblem',
  href: '/',
  width: 44,
  height: 40,
};

export const NAVIGATION_CATEGORIES: NavCategory[] = [
  {
    id: 'for-you',
    label: 'For you',
    subcategories: [
      {
        id: 'find-a-card',
        label: 'Find a card',
        items: [
          {
            label: 'Explore all cards',
            href: 'https://www.mastercard.com/us/en/personal/find-a-card.html',
            isOverview: true,
          },
          {
            label: 'Mastercard Credit Cards',
            href: 'https://www.mastercard.com/us/en/personal/find-a-card/credit-card.html',
          },
          {
            label: 'Mastercard Debit Cards',
            href: 'https://www.mastercard.com/us/en/personal/find-a-card/debit-card.html',
          },
          {
            label: 'Mastercard Prepaid Cards',
            href: 'https://www.mastercard.com/us/en/personal/find-a-card/prepaid-card.html',
          },
          {
            label: 'Cards for your passions',
            href: 'https://www.mastercard.com/us/en/personal/find-a-card/passion-cards.html',
          },
          {
            label: 'Card benefits',
            href: 'https://www.mastercard.com/us/en/personal/find-a-card/card-benefits.html',
          },
          {
            label: 'Mastercard Gift Cards',
            href: 'https://www.mastercard.com/us/en/personal/find-a-card/prepaid-card/prepaid-gift-mastercard.html',
          },
        ],
      },
      {
        id: 'planning-a-trip',
        label: 'Planning a trip',
        items: [
          {
            label: 'Access experiences, offers and benefits',
            href: 'https://www.mastercard.com/us/en/personal/travel.html',
          },
        ],
      },
      {
        id: 'ways-to-pay',
        label: 'Ways to pay',
        items: [
          {
            label: 'Pay your way',
            href: 'https://www.mastercard.com/us/en/personal/ways-to-pay.html',
            isOverview: true,
          },
          {
            label: 'Contactless',
            href: 'https://www.mastercard.com/us/en/personal/ways-to-pay/contactless.html',
          },
          {
            label: 'Click to Pay',
            href: 'https://www.mastercard.com/us/en/personal/ways-to-pay/click-to-pay.html',
          },
          {
            label: 'Payment passkeys',
            href: 'https://www.mastercard.com/us/en/personal/ways-to-pay/payment-passkeys.html',
          },
        ],
      },
      {
        id: 'protecting-you',
        label: 'Protecting you',
        items: [
          {
            label: 'Safety and security benefits',
            href: 'https://www.mastercard.com/us/en/personal/protection-and-security.html',
          },
          {
            label: 'Mastercard ID Theft Protection',
            href: 'https://mastercardus.idprotectiononline.com/enroll/home',
            external: true,
          },
        ],
      },
      {
        id: 'get-support',
        label: 'Get support',
        items: [
          {
            label: 'Support and contacts',
            href: 'https://www.mastercard.com/us/en/personal/get-support.html',
            isOverview: true,
          },
          {
            label: 'Find the nearest ATM',
            href: 'https://www.mastercard.com/us/en/personal/get-support/atm-near-me.html',
          },
          {
            label: 'Use our currency converter',
            href: 'https://www.mastercard.com/us/en/personal/get-support/currency-exchange-rate-converter.html',
          },
        ],
      },
      {
        id: 'experience-mastercard',
        label: 'Experience Mastercard',
        items: [
          {
            label: 'Enjoy Priceless experiences',
            href: 'https://www.mastercard.com/us/en/personal/experience-mastercard/priceless.html',
          },
          {
            label: 'Explore passions',
            href: 'https://www.mastercard.com/us/en/personal/experience-mastercard/noah-kahan.html',
          },
          {
            label: 'Our multisensory brand',
            href: 'https://www.mastercard.com/us/en/personal/experience-mastercard/multisensory-branding.html',
          },
        ],
      },
    ],
  },
  {
    id: 'for-business',
    label: 'For business',
    subcategories: [
      {
        id: 'explore-solutions',
        label: 'Explore solutions',
        items: [
          {
            label: 'Consumer payments',
            href: 'https://www.mastercard.com/us/en/business/payments/consumer-payments.html',
          },
          {
            label: 'Commercial payments',
            href: 'https://www.mastercard.com/us/en/business/payments/commercial-payments.html',
          },
          {
            label: 'Money movement',
            href: 'https://www.mastercard.com/us/en/business/payments/mastercard-move.html',
          },
          {
            label: 'Open finance',
            href: 'https://www.mastercard.com/us/en/business/open-finance.html',
          },
          {
            label: 'Advisors & transformation',
            href: 'https://www.mastercard.com/us/en/business/insights-intelligence/advisors-transformation.html',
          },
          {
            label: 'Cybersecurity & fraud prevention',
            href: 'https://www.mastercard.com/us/en/business/cybersecurity-fraud-prevention.html',
          },
          {
            label: 'Consumer acquisition & engagement',
            href: 'https://www.mastercard.com/us/en/business/consumer-acquisition-and-engagement.html',
          },
          {
            label: 'Insights & intelligence',
            href: 'https://www.mastercard.com/us/en/business/insights-intelligence.html',
          },
          {
            label: 'AI',
            href: 'https://www.mastercard.com/us/en/business/artificial-intelligence.html',
          },
          {
            label: 'Digital Asset Solutions',
            href: 'https://www.mastercard.com/us/en/business/payments/consumer-payments/next-gen-payments/digital-asset-solutions.html',
          },
        ],
      },
      {
        id: 'explore-by-industry-segment',
        label: 'Explore by industry segment',
        items: [
          {
            label: 'Financial institutions',
            href: 'https://www.mastercard.com/us/en/business/industry-segment/financial-institutions.html',
          },
          {
            label: 'Small and medium enterprises',
            href: 'https://www.mastercard.com/us/en/business/industry-segment/small-medium-business.html',
          },
          {
            label: 'Large corporations',
            href: 'https://www.mastercard.com/us/en/business/industry-segment/large-corporations.html',
          },
          {
            label: 'Public sector',
            href: 'https://www.mastercard.com/us/en/business/industry-segment/public-sector.html',
          },
          {
            label: 'Fintech',
            href: 'https://www.mastercard.com/us/en/business/industry-segment/fintech.html',
          },
          {
            label: 'Acquirers and PSPs',
            href: 'https://www.mastercard.com/us/en/business/industry-segment/acquirers-psps.html',
          },
          {
            label: 'Healthcare',
            href: 'https://www.mastercard.com/us/en/business/industry-segment/healthcare.html',
          },
        ],
      },
      {
        id: 'partner-programs',
        label: 'Partner programs',
        items: [
          {
            label: 'Partner Advantage Program',
            href: 'https://www.mastercard.com/us/en/business/services/mastercard-partner-advantage-program.html',
          },
          {
            label: 'Network Enablement Partners (NEP)',
            href: 'https://www.mastercard.com/us/en/business/support/network-enablement-partners.html',
          },
          {
            label: 'Mastercard Move',
            href: 'https://www.mastercard.com/us/en/business/payments/mastercard-move/partner-program.html',
          },
        ],
      },
      {
        id: 'business-support',
        label: 'Support',
        items: [
          {
            label: 'Find a payment facilitator',
            href: 'https://www.mastercard.com/us/en/business/support/payment-facilitators.html',
          },
          {
            label: 'Network Enablement Partners',
            href: 'https://www.mastercard.com/us/en/business/support/network-enablement-partners.html',
          },
          {
            label: 'Mastercard rules and compliance programs',
            href: 'https://www.mastercard.com/us/en/business/support/rules.html',
          },
          {
            label: 'BIN account range table',
            href: 'https://www.mastercard.com/us/en/business/support/simplified-bin-account-range-table.html',
          },
        ],
      },
    ],
  },
  {
    id: 'for-the-world',
    label: 'For the world',
    subcategories: [
      {
        id: 'making-an-impact',
        label: 'Making an impact',
        items: [
          {
            label: 'Corporate impact',
            href: 'https://www.mastercard.com/us/en/for-the-world/corporate-impact.html',
          },
          {
            label: 'Empowering people',
            href: 'https://www.mastercard.com/us/en/for-the-world/people.html',
          },
          {
            label: 'Pathways to prosperity',
            href: 'https://www.mastercard.com/us/en/for-the-world/prosperity.html',
          },
          {
            label: 'Preserving the planet',
            href: 'https://www.mastercard.com/us/en/for-the-world/planet.html',
          },
        ],
      },
      {
        id: 'empowering-people',
        label: 'Empowering people',
        items: [
          {
            label: 'Community and belonging',
            href: 'https://www.mastercard.com/us/en/for-the-world/people/community-belonging.html',
          },
          {
            label: 'Careers at Mastercard',
            href: 'https://careers.mastercard.com/us/en/',
            external: true,
          },
          {
            label: 'Community impact',
            href: 'https://www.mastercard.com/us/en/for-the-world/people/community-impact.html',
          },
          {
            label: 'Kids4Tech',
            href: 'https://www.mastercard.com/us/en/for-the-world/people/kids4tech.html',
          },
        ],
      },
      {
        id: 'pathways-to-prosperity',
        label: 'Pathways to prosperity',
        items: [
          {
            label: 'Mastercard Center for Inclusive Growth',
            href: 'https://www.mastercardcenter.org/',
            external: true,
          },
          {
            label: 'Financial Inclusion products and solutions',
            href: 'https://www.mastercard.com/us/en/for-the-world/prosperity/financial-inclusion-products-and-solutions.html',
          },
          {
            label: 'Mastercard Community Pass',
            href: 'https://www.mastercard.com/us/en/for-the-world/prosperity/community-pass.html',
          },
        ],
      },
      {
        id: 'preserving-the-planet',
        label: 'Preserving the planet',
        items: [
          {
            label: 'Reducing our GHG emissions',
            href: 'https://www.mastercard.com/us/en/for-the-world/planet/net-zero-emissions.html',
          },
          {
            label: 'Environmentally conscious choices',
            href: 'https://www.mastercard.com/us/en/for-the-world/planet/conscious-choices.html',
          },
          {
            label: 'Priceless Planet Coalition',
            href: 'https://www.mastercard.com/us/en/for-the-world/planet/priceless-planet.html',
          },
          {
            label: 'Carbon Calculator',
            href: 'https://www.mastercard.com/us/en/for-the-world/planet/priceless-planet/carbon-calculator.html',
          },
          {
            label: 'Digital First card program',
            href: 'https://www.mastercard.com/us/en/business/payments/consumer-payments/next-gen-payments/digital-first.html',
          },
        ],
      },
      {
        id: 'about-mastercard',
        label: 'About Mastercard',
        items: [
          {
            label: 'About us',
            href: 'https://www.mastercard.com/us/en/for-the-world/about-us.html',
          },
          {
            label: 'Privacy and data responsibility',
            href: 'https://www.mastercard.com/us/en/for-the-world/about-us/mastercard-privacy-and-data-responsibility.html',
          },
          {
            label: 'Reports, policies and statements',
            href: 'https://www.mastercard.com/us/en/for-the-world/about-us/reports-policies-and-statements.html',
          },
        ],
      },
    ],
  },
  {
    id: 'for-innovators',
    label: 'For innovators',
    subcategories: [
      {
        id: 'build-with-us',
        label: 'Build with us',
        items: [
          {
            label: 'Developers',
            href: 'https://www.mastercard.com/us/en/innovation/build-with-us/mastercard-developers.html',
          },
          {
            label: 'Digital labs',
            href: 'https://www.mastercard.com/us/en/innovation/build-with-us/digital-labs.html',
          },
        ],
      },
      {
        id: 'partner-with-us',
        label: 'Partner with us',
        items: [
          {
            label: 'Start Path',
            href: 'https://www.mastercard.com/us/en/innovation/partner-with-us/start-path.html',
          },
          {
            label: 'Mastercard Engage',
            href: 'https://www.mastercard.com/us/en/business/industry-segment/fintech/program/engage.html',
          },
          {
            label: 'Product Express',
            href: 'https://www.mastercard.com/us/en/business/industry-segment/fintech/program/product-express.html',
          },
        ],
      },
      {
        id: 'explore-with-us',
        label: 'Explore with us',
        items: [
          {
            label: 'Research and insights',
            href: 'https://www.mastercard.com/us/en/innovation/explore-with-us/mastercard-signals-research-insights.html',
          },
          {
            label: 'Research and development',
            href: 'https://www.mastercard.com/us/en/innovation/explore-with-us/research-development.html',
          },
        ],
      },
      {
        id: 'engage-with-us',
        label: 'Engage with us',
        items: [
          {
            label: 'Experience Centers',
            href: 'https://www.mastercard.com/us/en/innovation/engage-with-us/mastercard-experience-center.html',
          },
        ],
      },
    ],
  },
  {
    id: 'news-and-trends',
    label: 'News and trends',
    subcategories: [
      {
        id: 'newsroom',
        label: 'Newsroom',
        items: [
          {
            label: 'Global newsroom',
            href: 'https://www.mastercard.com/us/en/news-and-trends/stories.html',
          },
          {
            label: 'Asia Pacific newsroom',
            href: 'https://www.mastercard.com/news/ap/en',
            external: true,
          },
          {
            label: 'European newsroom',
            href: 'https://www.mastercard.com/news/europe/en',
            external: true,
          },
          {
            label: 'Eastern Europe, Middle East Africa newsroom',
            href: 'https://www.mastercard.com/news/eemea/en/',
            external: true,
          },
          {
            label: 'Latin America newsroom',
            href: 'https://www.mastercard.com/news/latin-america/es',
            external: true,
          },
        ],
      },
      {
        id: 'featured-topics',
        label: 'Featured topics',
        items: [
          {
            label: 'AI',
            href: 'https://www.mastercard.com/us/en/news-and-trends/featured-topic/artificial-intelligence-featured-topic.html',
          },
          {
            label: 'Cybersecurity',
            href: 'https://www.mastercard.com/us/en/news-and-trends/featured-topic/cybersecurity-featured-topic.html',
          },
          {
            label: 'Open finance',
            href: 'https://www.mastercard.com/us/en/news-and-trends/featured-topic/open-finance.html',
          },
          {
            label: 'Small business',
            href: 'https://www.mastercard.com/us/en/news-and-trends/featured-topic/small-business-featured-topic.html',
          },
          {
            label: 'Digital assets',
            href: 'https://www.mastercard.com/us/en/news-and-trends/featured-topic/digital-assets-featured-topic.html',
          },
          {
            label: 'Account to account',
            href: 'https://www.mastercard.com/us/en/news-and-trends/featured-topic/account-to-account-payments.html',
          },
          {
            label: 'Consumer acquisition & engagement',
            href: 'https://www.mastercard.com/us/en/news-and-trends/featured-topic/consumer-acquisition-and-engagement-featured-topic.html',
          },
          {
            label: 'Insights & Intelligence',
            href: 'https://www.mastercard.com/us/en/news-and-trends/featured-topic/insight-and-intelligence.html',
          },
          {
            label: 'Personalization',
            href: 'https://www.mastercard.com/us/en/news-and-trends/featured-topic/personalization.html',
          },
        ],
      },
      {
        id: 'insights-and-reports',
        label: 'Insights & reports',
        items: [
          {
            label: 'Mastercard Economics Institute',
            href: 'https://www.mastercard.com/us/en/news-and-trends/insights-report/mastercard-economic-institute.html',
          },
          {
            label: 'SpendingPulse™',
            href: 'https://www.mastercardservices.com/en/capabilities/spendingpulse',
            external: true,
          },
          {
            label: 'Mastercard Business Intelligence',
            href: 'https://mbi.mastercardservices.com/?utm_source=mastercardwebsite&utm_medium=loginbanner&utm_campaign=insights_reports&utm_id=mbi&utm_term=global',
            external: true,
          },
        ],
      },
      {
        id: 'press-resources',
        label: 'Press resources',
        items: [
          {
            label: 'Press releases',
            href: 'https://www.mastercard.com/us/en/news-and-trends/press.html',
          },
          {
            label: 'Executive bios',
            href: 'https://www.mastercard.com/us/en/news-and-trends/press/executive-bios.html',
          },
          {
            label: 'Media contacts',
            href: 'https://www.mastercard.com/us/en/news-and-trends/press/media-contacts.html',
          },
        ],
      },
      {
        id: 'investor-relations',
        label: 'Investor relations',
        items: [
          {
            label: 'Access our latest financial reporting',
            href: 'https://investor.mastercard.com/financials-and-sec-filings/default.aspx',
            external: true,
          },
        ],
      },
    ],
  },
];

export const SEARCH_PROMPT_HEADING = 'What are you looking for?';

export const POPULAR_SEARCH_LINKS: PopularSearchLink[] = [
  {
    label: 'Find a card',
    href: 'https://www.mastercard.com/us/en/personal/find-a-card.html',
  },
  {
    label: 'AI',
    href: 'https://www.mastercard.com/us/en/business/artificial-intelligence.html',
  },
  {
    label: 'Cybersecurity & Fraud Prevention',
    href: 'https://www.mastercard.com/us/en/business/cybersecurity-fraud-prevention.html',
  },
  {
    label: 'Insights & Intelligence',
    href: 'https://www.mastercard.com/us/en/business/insights-intelligence.html',
  },
  {
    label: 'Personalization',
    href: 'https://www.mastercard.com/us/en/business/consumer-acquisition-and-engagement/personalization.html',
  },
  {
    label: 'Money Movement',
    href: 'https://www.mastercard.com/us/en/business/payments/mastercard-move.html',
  },
  {
    label: 'Commercial Payments',
    href: 'https://www.mastercard.com/us/en/business/payments/commercial-payments.html',
  },
  {
    label: 'Open Finance',
    href: 'https://www.mastercard.com/us/en/business/open-finance.html',
  },
  {
    label: 'Digital Assets',
    href: 'https://www.mastercard.com/us/en/business/payments/consumer-payments/next-gen-payments/digital-asset-solutions.html',
  },
];

export const FEATURED_CONTENT_HEADING = 'Featured Content';

export const FEATURED_CONTENT_ITEMS: FeaturedContentItem[] = [
  {
    title: 'Announcing the Mastercard Partner Advantage Program',
    description:
      "Whether you're seeking the right partner or ready to become one, our network helps you connect, grow and scale faster.",
    href: 'https://www.mastercard.com/us/en/business/services/mastercard-partner-advantage-program.html',
    external: true,
  },
  {
    title: 'Consumers are switching. Revenue is shifting. Open finance can be your differentiator.',
    description: 'Read The state of open finance 2026 report.',
    href: 'https://www.mastercard.com/us/en/news-and-trends/Insights/2026/the-state-of-open-finance-2026.html',
    external: true,
  },
  {
    title: 'Turn everyday transactions into lasting loyalty',
    description:
      'Traditional account management is no longer enough. Learn what consumers are looking for in their post-purchase experience in our new research with Datos Insights.',
    href: 'https://www.mastercard.com/us/en/news-and-trends/Insights/2026/turn-everyday-transactions-into-lasting-loyalty.html',
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
          keywords: `${item.label} ${sub.label} ${cat.label}`.toLowerCase(),
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
      section: 'Featured Content',
      external: feat.external,
      keywords: `${feat.title} ${feat.description}`.toLowerCase(),
    });
  }

  return entries;
}

export const SEARCH_INDEX: SearchEntry[] = buildSearchIndex();
