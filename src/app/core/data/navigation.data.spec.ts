import { describe, expect, it } from 'vitest';
import {
  BRAND_LOGO,
  FEATURED_CONTENT_ITEMS,
  NAVIGATION_CATEGORIES,
  POPULAR_SEARCH_LINKS,
  SEARCH_INDEX,
  getAllPublicCatalogPaths,
  resolveCatalogRoute,
} from './navigation.data';

describe('navigation.data', () => {
  it('preserves brand logo and all five primary navigation pillars', () => {
    expect(BRAND_LOGO.src).toBe('/images/decaspark-emblem.png');
    expect(NAVIGATION_CATEGORIES.map((c) => c.label)).toEqual([
      'Products',
      'Services',
      'For Teams',
      'Resources',
      'Company',
    ]);
  });

  it('indexes 20 subcategories, 91 leaf items, and deduplicated search entries', () => {
    const subcategories = NAVIGATION_CATEGORIES.flatMap((c) => c.subcategories);
    const items = subcategories.flatMap((s) => s.items);
    const externalItems = items.filter((i) => i.external);

    expect(subcategories).toHaveLength(20);
    expect(items).toHaveLength(91);
    expect(externalItems).toHaveLength(1);
    expect(externalItems[0]?.href).toBe('https://github.com/Decaspark');
    expect(POPULAR_SEARCH_LINKS).toHaveLength(8);
    expect(FEATURED_CONTENT_ITEMS).toHaveLength(3);
    expect(SEARCH_INDEX).toHaveLength(91);
  });

  it('resolves 1-segment, 2-segment, and 3-segment catalog routes accurately', () => {
    const topPillar = resolveCatalogRoute('/products');
    expect(topPillar?.heading).toBe('Products');
    expect(topPillar?.activeSubcategory).toBeNull();

    const subOverview = resolveCatalogRoute('/products/books/');
    expect(subOverview?.heading).toBe('Books & Print Editions');
    expect(subOverview?.activeSubcategory?.id).toBe('books-print-editions');
    expect(subOverview?.activeItem?.isOverview).toBe(true);

    const leaf = resolveCatalogRoute('/services/ai-systems/knowledge-retrieval?ref=nav');
    expect(leaf?.heading).toBe('Knowledge Retrieval (RAG) Systems');
    expect(leaf?.category.id).toBe('services');
  });

  it('returns null for home, search, and non-existent catalog paths', () => {
    expect(resolveCatalogRoute('/')).toBeNull();
    expect(resolveCatalogRoute('/search')).toBeNull();
    expect(resolveCatalogRoute('/unknown-section')).toBeNull();
    expect(resolveCatalogRoute('/products/unknown-leaf')).toBeNull();
  });

  it('enumerates all 94 prerenderable public catalog paths', () => {
    const allPaths = getAllPublicCatalogPaths();
    expect(allPaths).toHaveLength(94);
    expect(allPaths).toContain('/products/books/strategy-books');
    expect(allPaths).toContain('/services/automation');
    expect(allPaths).toContain('/company/about');
  });
});
