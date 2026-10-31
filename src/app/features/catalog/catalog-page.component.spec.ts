import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { routes } from '../../app.routes';

describe('Feature Routes (Catalog, Search, NotFound)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('renders preserved catalog metadata on /products/books/strategy-books', async () => {
    const harness = await RouterTestingHarness.create('/products/books/strategy-books');
    const h1 = harness.routeNativeElement?.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('Authored Technical & Strategy Books');
  });

  it('renders search results when navigating to /search?q=automation', async () => {
    const harness = await RouterTestingHarness.create('/search?q=automation');
    const h1 = harness.routeNativeElement?.querySelector('h1');
    expect(h1?.textContent).toContain('Results for “automation”');
    const items = harness.routeNativeElement?.querySelectorAll(
      'section[aria-label="Search results"] li',
    );
    expect(items?.length ?? 0).toBeGreaterThan(0);
  });

  it('routes non-existent catalog paths through canMatch to NotFoundPageComponent', async () => {
    const harness = await RouterTestingHarness.create('/products/nonexistent-item');
    const h1 = harness.routeNativeElement?.querySelector('h1');
    expect(h1?.textContent).toContain('This page could not be found.');
  });
});
