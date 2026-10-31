import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const MOBILE_MEDIA_QUERY = '(max-width: 939px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobileView = signal<boolean>(false);
  readonly prefersReducedMotion = signal<boolean>(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isMobileView.set(this.breakpointObserver.isMatched(MOBILE_MEDIA_QUERY));
    this.prefersReducedMotion.set(this.breakpointObserver.isMatched(REDUCED_MOTION_QUERY));

    this.breakpointObserver
      .observe([MOBILE_MEDIA_QUERY, REDUCED_MOTION_QUERY])
      .pipe(takeUntilDestroyed())
      .subscribe((state) => {
        this.isMobileView.set(Boolean(state.breakpoints[MOBILE_MEDIA_QUERY]));
        this.prefersReducedMotion.set(Boolean(state.breakpoints[REDUCED_MOTION_QUERY]));
      });
  }
}
