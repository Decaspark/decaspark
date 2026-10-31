import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '../../app.routes';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders Decaspark emblem and all five primary L1 navigation buttons', () => {
    const logoImg = element.querySelector<HTMLImageElement>('.navigation-bar__primary-logo img');
    expect(logoImg?.getAttribute('src')).toBe('/images/decaspark-emblem.png');
    expect(logoImg?.getAttribute('alt')).toBe('Decaspark emblem');

    const l1Labels = Array.from(element.querySelectorAll('.l1-container .nav-item .l1-label')).map(
      (el) => el.textContent?.trim(),
    );
    expect(l1Labels).toEqual(['Products', 'Services', 'For Teams', 'Resources', 'Company']);
  });

  it('expands L1 mega-menu and L2 subcategory panel on click', () => {
    const productsBtn = element.querySelector<HTMLButtonElement>('#l1-btn-products');
    expect(productsBtn?.getAttribute('aria-expanded')).toBe('false');

    productsBtn?.click();
    fixture.detectChanges();

    expect(productsBtn?.getAttribute('aria-expanded')).toBe('true');
    const l2Container = element.querySelector<HTMLElement>('#l2-products');
    expect(l2Container?.getAttribute('aria-hidden')).toBe('false');

    const booksL2Btn = element.querySelector<HTMLButtonElement>('#l2-btn-books-print-editions');
    booksL2Btn?.click();
    fixture.detectChanges();

    const l3Container = element.querySelector<HTMLElement>('#l3-books-print-editions');
    expect(l3Container?.getAttribute('aria-hidden')).toBe('false');
  });

  it('opens instant search, filters live results, and handles unmatched queries', () => {
    const searchToggle = element.querySelector<HTMLButtonElement>('#search-toggle');
    searchToggle?.click();
    fixture.detectChanges();

    expect(searchToggle?.getAttribute('aria-expanded')).toBe('true');

    const input = element.querySelector<HTMLInputElement>('#autocomplete-0-input');
    expect(input).toBeTruthy();

    if (input) {
      input.value = 'automation';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    const hits = element.querySelectorAll('#autocomplete-0-list .aa-Item');
    expect(hits.length).toBeGreaterThan(0);

    if (input) {
      input.value = 'zzzz-unmatched-query';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    const noResultsHeader = element.querySelector('.no-results-header');
    expect(noResultsHeader?.textContent).toContain('No Results Found.');
  });
});
