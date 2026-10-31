import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { NavigationStateService } from './navigation-state.service';

@Component({ template: '' })
class DummyRouteComponent {}

describe('NavigationStateService', () => {
  let service: NavigationStateService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: DummyRouteComponent },
          { path: 'products/books', component: DummyRouteComponent },
        ]),
      ],
    });
    service = TestBed.inject(NavigationStateService);
    router = TestBed.inject(Router);
  });

  it('opens and toggles L1 and L2 navigation panels cleanly', () => {
    expect(service.overlayActive()).toBe(false);

    service.toggleL1('products');
    expect(service.activeL1Id()).toBe('products');
    expect(service.overlayActive()).toBe(true);

    service.toggleL2('books-print-editions');
    expect(service.activeL2Id()).toBe('books-print-editions');

    // Switching L1 resets activeL2Id
    service.toggleL1('services');
    expect(service.activeL1Id()).toBe('services');
    expect(service.activeL2Id()).toBeNull();

    // Toggling same L1 closes menu
    service.toggleL1('services');
    expect(service.activeL1Id()).toBeNull();
    expect(service.overlayActive()).toBe(false);
  });

  it('filters live search hits and computes activeDescendantId', () => {
    service.openSearch();
    expect(service.searchOpen()).toBe(true);
    expect(service.filteredHits()).toHaveLength(0);

    service.setSearchQuery('automation');
    expect(service.filteredHits().length).toBeGreaterThan(0);
    expect(service.activeDescendantId()).toBe('');

    service.activeHitIndex.set(0);
    expect(service.activeDescendantId()).toBe('autocomplete-hit-0');

    // Changing query resets activeHitIndex
    service.setSearchQuery('nonexistent-xyz-query');
    expect(service.activeHitIndex()).toBe(-1);
    expect(service.filteredHits()).toHaveLength(0);
  });

  it('closes active navigation state automatically on route navigation', async () => {
    service.toggleL1('products');
    expect(service.activeL1Id()).toBe('products');

    await router.navigateByUrl('/products/books');
    expect(service.activeL1Id()).toBeNull();
    expect(service.overlayActive()).toBe(false);
  });
});
