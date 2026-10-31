export interface BrandLogo {
  readonly src: string;
  readonly alt: string;
  readonly href: string;
  readonly width: number;
  readonly height: number;
}

export interface NavLeafItem {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
  readonly isOverview?: boolean;
  readonly tags?: string;
}

export interface NavSubcategory {
  readonly id: string;
  readonly label: string;
  readonly items: readonly NavLeafItem[];
}

export interface NavCategory {
  readonly id: string;
  readonly label: string;
  readonly subcategories: readonly NavSubcategory[];
}

export interface PopularSearchLink {
  readonly label: string;
  readonly href: string;
}

export interface FeaturedContentItem {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly external?: boolean;
}

export interface SearchEntry {
  readonly id: string;
  readonly title: string;
  readonly href: string;
  readonly section: string;
  readonly external?: boolean;
  readonly keywords: string;
}

export interface ResolvedCatalogRoute {
  readonly path: string;
  readonly category: NavCategory;
  readonly activeSubcategory: NavSubcategory | null;
  readonly activeItem: NavLeafItem | null;
  readonly heading: string;
  readonly eyebrow: string;
  readonly description: string;
}

export interface PageSeoMetadata {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly type?: 'website' | 'article';
  readonly noindex?: boolean;
}
