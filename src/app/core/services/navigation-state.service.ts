import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SEARCH_INDEX } from '../data/navigation.data';
import { SearchEntry } from '../models/navigation.models';
import { ViewportService } from './viewport.service';
import { ScrollLockService } from './scroll-lock.service';

@Injectable({ providedIn: 'root' })
export class NavigationStateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly viewport = inject(ViewportService);
  private readonly scrollLock = inject(ScrollLockService);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly destroyRef = inject(DestroyRef);

  private searchCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private previousIsMobile = false;

  readonly activeL1Id = signal<string | null>(null);
  readonly activeL2Id = signal<string | null>(null);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly searchOpen = signal<boolean>(false);
  readonly searchClosing = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly activeHitIndex = signal<number>(-1);

  readonly overlayActive = computed<boolean>(() =>
    Boolean(this.activeL1Id() || this.mobileMenuOpen() || this.searchOpen()),
  );

  readonly isMobileL1Only = computed<boolean>(
    () =>
      this.viewport.isMobileView() &&
      this.mobileMenuOpen() &&
      !this.activeL1Id() &&
      !this.searchOpen(),
  );

  readonly trimmedQuery = computed<string>(() => this.searchQuery().trim());

  readonly filteredHits = computed<readonly SearchEntry[]>(() => {
    const q = this.trimmedQuery().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter(
      (entry) => entry.title.toLowerCase().includes(q) || entry.keywords.includes(q),
    ).slice(0, 8);
  });

  readonly activeDescendantId = computed<string>(() => {
    const idx = this.activeHitIndex();
    const hits = this.filteredHits();
    return idx >= 0 && idx < hits.length ? `autocomplete-hit-${idx}` : '';
  });

  constructor() {
    this.previousIsMobile = this.viewport.isMobileView();

    // Reset open drawers/menus when crossing the 939px/940px responsive boundary
    effect(() => {
      const currentIsMobile = this.viewport.isMobileView();
      if (currentIsMobile !== this.previousIsMobile) {
        this.previousIsMobile = currentIsMobile;
        this.clearSearchCloseTimer();
        this.activeL1Id.set(null);
        this.activeL2Id.set(null);
        this.mobileMenuOpen.set(false);
        this.searchClosing.set(false);
      }
    });

    // Lock body scroll whenever an overlay or drawer is open
    effect(() => {
      this.scrollLock.setLocked(this.overlayActive());
    });

    // Announce live search suggestion count for screen readers
    effect(() => {
      const q = this.trimmedQuery();
      const hits = this.filteredHits();
      if (isPlatformBrowser(this.platformId) && this.searchOpen() && q.length > 0) {
        const message =
          hits.length === 0
            ? 'No search results found'
            : `${hits.length} search suggestion${hits.length === 1 ? '' : 's'} available`;
        void this.liveAnnouncer.announce(message, 'polite');
      }
    });

    // Automatically close menus and search after route transitions
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.closeImmediate();
      });

    this.destroyRef.onDestroy(() => {
      this.clearSearchCloseTimer();
      this.scrollLock.setLocked(false);
    });
  }

  setSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.activeHitIndex.set(-1);
  }

  toggleMobileMenu(): void {
    this.clearSearchCloseTimer();
    this.searchClosing.set(false);
    if (this.mobileMenuOpen() || this.activeL1Id()) {
      this.mobileMenuOpen.set(false);
      this.activeL1Id.set(null);
      this.activeL2Id.set(null);
    } else {
      this.searchOpen.set(false);
      this.searchQuery.set('');
      this.activeHitIndex.set(-1);
      this.mobileMenuOpen.set(true);
    }
  }

  toggleL1(l1Id: string): void {
    this.clearSearchCloseTimer();
    this.searchClosing.set(false);
    this.searchOpen.set(false);
    this.searchQuery.set('');
    this.activeHitIndex.set(-1);

    if (this.activeL1Id() === l1Id) {
      this.activeL1Id.set(null);
      this.activeL2Id.set(null);
    } else {
      this.activeL1Id.set(l1Id);
      this.activeL2Id.set(null);
    }
  }

  toggleL2(l2Id: string): void {
    this.activeL2Id.update((prev) => (prev === l2Id ? null : l2Id));
  }

  openL2(l2Id: string): void {
    this.activeL2Id.set(l2Id);
  }

  closeL2(): void {
    this.activeL2Id.set(null);
  }

  closeL1(): void {
    this.activeL1Id.set(null);
    this.activeL2Id.set(null);
  }

  toggleSearch(): boolean {
    if (this.searchOpen()) {
      this.closeSearchAnimated();
      return false;
    }
    this.openSearch();
    return true;
  }

  openSearch(): void {
    this.clearSearchCloseTimer();
    this.searchClosing.set(false);
    this.activeL1Id.set(null);
    this.activeL2Id.set(null);
    this.mobileMenuOpen.set(false);
    this.searchOpen.set(true);
  }

  closeSearchAnimated(): void {
    this.clearSearchCloseTimer();
    this.searchOpen.set(false);
    this.activeHitIndex.set(-1);

    if (!isPlatformBrowser(this.platformId) || this.viewport.prefersReducedMotion()) {
      this.searchClosing.set(false);
      this.searchQuery.set('');
      return;
    }

    this.searchClosing.set(true);
    this.searchCloseTimer = setTimeout(() => {
      this.searchClosing.set(false);
      this.searchQuery.set('');
      this.searchCloseTimer = null;
    }, 420);
  }

  closeAll(): void {
    this.activeL1Id.set(null);
    this.activeL2Id.set(null);
    this.mobileMenuOpen.set(false);
    if (this.searchOpen()) {
      this.closeSearchAnimated();
    } else {
      this.closeImmediate();
    }
  }

  closeImmediate(): void {
    this.clearSearchCloseTimer();
    this.activeL1Id.set(null);
    this.activeL2Id.set(null);
    this.mobileMenuOpen.set(false);
    this.searchOpen.set(false);
    this.searchClosing.set(false);
    this.searchQuery.set('');
    this.activeHitIndex.set(-1);
  }

  private clearSearchCloseTimer(): void {
    if (this.searchCloseTimer !== null) {
      clearTimeout(this.searchCloseTimer);
      this.searchCloseTimer = null;
    }
  }
}
