import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;
  let title: Title;
  let meta: Meta;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    seo = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
  });

  it('sets document title, Open Graph tags, and canonical URL for public pages', () => {
    seo.update({
      title: 'Books & Print Editions — Decaspark',
      description: 'Authored technical and strategy books from Decaspark Press.',
      path: '/products/books',
    });

    expect(title.getTitle()).toBe('Books & Print Editions — Decaspark');
    expect(meta.getTag('name="description"')?.content).toContain('Decaspark Press');
    expect(meta.getTag('property="og:url"')?.content).toBe('https://decaspark.com/products/books');
    expect(meta.getTag('name="robots"')?.content).toBe('index, follow');

    const canonical = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://decaspark.com/products/books');
  });

  it('marks 404 pages noindex and removes canonical link', () => {
    seo.update({
      title: 'Page Not Found — Decaspark',
      description: 'Not found.',
      path: '/missing-route',
      noindex: true,
    });

    expect(meta.getTag('name="robots"')?.content).toBe('noindex, nofollow');
    expect(doc.head.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
