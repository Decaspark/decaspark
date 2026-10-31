import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewEncapsulation,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND_LOGO, NAVIGATION_CATEGORIES } from '../../core/data/navigation.data';
import { NavigationStateService } from '../../core/services/navigation-state.service';
import { ViewportService } from '../../core/services/viewport.service';
import { UiIconComponent } from '../../shared/components/icons/ui-icon.component';
import { NavbarMegaMenuComponent } from './navbar-mega-menu.component';
import { NavbarSearchPanelComponent } from './navbar-search-panel.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, UiIconComponent, NavbarMegaMenuComponent, NavbarSearchPanelComponent],
  styleUrl: './navbar.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="experiencefragment">
      <div class="cmp-experiencefragment cmp-experiencefragment--header">
        <div #headerContainer [class]="headerClasses()" (focusout)="onHeaderFocusOut($event)">
          <div [class]="navBarClasses()">
            <!-- Left: Decaspark Brand Emblem -->
            <div class="navigation-bar__logo-wrapper">
              <div class="navigation-bar__logo navigation-bar__primary-logo">
                <a
                  #logoLink
                  [routerLink]="brandLogo.href"
                  aria-label="Decaspark Home"
                  (click)="navState.closeImmediate()"
                  (keydown)="onLogoKeyDown($event)"
                >
                  <img
                    [src]="brandLogo.src"
                    [alt]="brandLogo.alt"
                    [width]="brandLogo.width"
                    [height]="brandLogo.height"
                    decoding="async"
                  />
                </a>
              </div>
            </div>

            <!-- Center: Primary Navigation + Mega-Menu + Mobile Drawer -->
            <nav class="navigation-bar__main" aria-label="Main navigation">
              <button
                #mobileMenuButton
                type="button"
                class="mobile-menu-button"
                [attr.aria-expanded]="
                  navState.mobileMenuOpen() || navState.activeL1Id() !== null ? 'true' : 'false'
                "
                aria-controls="mobileMenu"
                (click)="navState.toggleMobileMenu()"
              >
                <span class="mobile-menu-button-text">
                  {{
                    navState.mobileMenuOpen() || navState.activeL1Id() !== null
                      ? 'Close Menu'
                      : 'Open Menu'
                  }}
                </span>
                <span class="mobile-menu-button-indicator" aria-hidden="true"></span>
              </button>

              <div class="l1-container">
                <div
                  id="mobileMenu"
                  class="mobile-menu"
                  [attr.aria-hidden]="
                    viewport.isMobileView()
                      ? navState.mobileMenuOpen()
                        ? 'false'
                        : 'true'
                      : 'false'
                  "
                >
                  <ul>
                    @for (l1 of categories; track l1.id; let l1Index = $index) {
                      @let isL1Open = navState.activeL1Id() === l1.id;
                      <li class="nav-item">
                        <button
                          [id]="'l1-btn-' + l1.id"
                          type="button"
                          [attr.aria-expanded]="isL1Open ? 'true' : 'false'"
                          [attr.aria-controls]="'l2-' + l1.id"
                          (click)="navState.toggleL1(l1.id)"
                          (keydown)="onL1KeyDown($event, l1Index, l1.id)"
                        >
                          <span class="l1-label">{{ l1.label }}</span>
                          <span class="l1-mobile-chevron" aria-hidden="true">
                            <app-ui-icon name="chevron-right" [size]="20" />
                          </span>
                        </button>
                      </li>
                    }
                  </ul>
                </div>
              </div>

              <!-- Level 2 & Level 3 Panels -->
              <app-navbar-mega-menu
                #megaMenu
                [categories]="categories"
                (focusL1Requested)="focusL1Button($event)"
                (focusSearchToggleRequested)="focusSearchToggle()"
              />
            </nav>

            <!-- Right: Search Toggle & Decaspark Search Content -->
            <div class="navigation-bar__search">
              <app-navbar-search-panel
                #searchPanel
                (focusSearchToggleRequested)="focusSearchToggle()"
                (focusLogoRequested)="focusLogo()"
              />

              <button
                #searchToggleButton
                id="search-toggle"
                type="button"
                class="search-toggle"
                [attr.aria-label]="navState.searchOpen() ? 'Close search' : 'Open search'"
                [attr.aria-expanded]="navState.searchOpen() ? 'true' : 'false'"
                aria-controls="search-content"
                (click)="onSearchToggleClick()"
                (keydown)="onSearchToggleKeyDown($event)"
              >
                <span class="toggle-icon search-icon" aria-hidden="true">
                  <app-ui-icon name="search" [size]="14" />
                </span>
                <span class="toggle-icon close-icon" aria-hidden="true">
                  <app-ui-icon name="close" [size]="14" />
                </span>
              </button>
            </div>
          </div>

          <div [class]="overlayClasses()" aria-hidden="true" (click)="onOverlayClick()"></div>
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  protected readonly navState = inject(NavigationStateService);
  protected readonly viewport = inject(ViewportService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly brandLogo = BRAND_LOGO;
  protected readonly categories = NAVIGATION_CATEGORIES;

  private readonly headerRef = viewChild<ElementRef<HTMLDivElement>>('headerContainer');
  private readonly logoLinkRef = viewChild<ElementRef<HTMLAnchorElement>>('logoLink');
  private readonly mobileButtonRef = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuButton');
  private readonly searchToggleRef = viewChild<ElementRef<HTMLButtonElement>>('searchToggleButton');
  private readonly megaMenuRef = viewChild<NavbarMegaMenuComponent>('megaMenu');
  private readonly searchPanelRef = viewChild<NavbarSearchPanelComponent>('searchPanel');

  protected readonly headerClasses = computed<string>(() =>
    [
      'navigation-header',
      this.navState.overlayActive() ? 'active' : '',
      this.navState.searchOpen() ? 'search' : '',
      this.navState.searchClosing() ? 'search-closing' : '',
      this.navState.isMobileL1Only() ? 'mobile-l1-only' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly navBarClasses = computed<string>(() =>
    this.navState.overlayActive() ? 'navigation-bar active' : 'navigation-bar',
  );

  protected readonly overlayClasses = computed<string>(() =>
    this.navState.overlayActive() ? 'navigation-overlay active' : 'navigation-overlay',
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const onGlobalKeyDown = (event: KeyboardEvent): void => {
        if (!this.navState.overlayActive()) return;
        if (event.key !== 'Escape' && event.key !== 'Esc') return;

        if (this.navState.searchOpen()) {
          event.preventDefault();
          this.navState.closeSearchAnimated();
          this.focusSearchToggle();
        } else if (this.navState.activeL2Id()) {
          event.preventDefault();
          const prevL2 = this.navState.activeL2Id();
          this.navState.closeL2();
          if (prevL2) {
            this.megaMenuRef()?.focusL2Button(prevL2);
          }
        } else if (this.navState.activeL1Id()) {
          event.preventDefault();
          const prevL1 = this.navState.activeL1Id();
          this.navState.closeL1();
          if (prevL1) {
            this.focusL1Button(prevL1);
          }
        } else if (this.navState.mobileMenuOpen()) {
          event.preventDefault();
          this.navState.mobileMenuOpen.set(false);
          this.mobileButtonRef()?.nativeElement.focus();
        }
      };

      this.document.addEventListener('keydown', onGlobalKeyDown);
      this.destroyRef.onDestroy(() => {
        this.document.removeEventListener('keydown', onGlobalKeyDown);
      });
    }
  }

  protected onHeaderFocusOut(event: FocusEvent): void {
    const related = event.relatedTarget;
    const headerEl = this.headerRef()?.nativeElement;
    if (related instanceof Node && headerEl && !headerEl.contains(related)) {
      this.navState.closeAll();
    }
  }

  protected onOverlayClick(): void {
    this.navState.closeAll();
    this.focusSearchToggle();
  }

  protected onSearchToggleClick(): void {
    const opened = this.navState.toggleSearch();
    if (!opened) {
      this.focusSearchToggle();
    }
  }

  protected onLogoKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (this.navState.searchOpen()) {
        this.searchPanelRef()?.focusInput();
      } else {
        const firstL1 = this.categories[0];
        if (firstL1) {
          this.focusL1Button(firstL1.id);
        }
      }
    }
  }

  protected onSearchToggleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (this.navState.searchOpen()) {
        this.searchPanelRef()?.focusInput();
      } else {
        const lastL1 = this.categories[this.categories.length - 1];
        if (lastL1) {
          this.focusL1Button(lastL1.id);
        }
      }
    }
  }

  protected onL1KeyDown(event: KeyboardEvent, l1Index: number, l1Id: string): void {
    const l1Item = this.categories[l1Index];
    if (!l1Item) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'Right': {
        event.preventDefault();
        const nextL1 = this.categories[l1Index + 1];
        if (nextL1) {
          this.focusL1Button(nextL1.id);
        } else if (!this.viewport.isMobileView()) {
          this.navState.closeL1();
          this.focusSearchToggle();
        }
        break;
      }
      case 'ArrowLeft':
      case 'Left': {
        event.preventDefault();
        const prevL1 = l1Index > 0 ? this.categories[l1Index - 1] : undefined;
        if (prevL1) {
          this.focusL1Button(prevL1.id);
        } else {
          this.navState.closeL1();
          this.navState.mobileMenuOpen.set(false);
          this.focusLogo();
        }
        break;
      }
      case 'ArrowDown':
      case 'Down': {
        event.preventDefault();
        this.navState.activeL1Id.set(l1Id);
        this.navState.activeL2Id.set(null);
        const win = this.document.defaultView;
        if (win) {
          win.requestAnimationFrame(() => {
            this.megaMenuRef()?.focusFirstL2(l1Id);
          });
        } else {
          this.megaMenuRef()?.focusFirstL2(l1Id);
        }
        break;
      }
      case 'Escape':
      case 'Esc': {
        if (this.navState.activeL1Id() || this.navState.mobileMenuOpen()) {
          event.preventDefault();
          event.stopPropagation();
          this.navState.closeL1();
          if (this.viewport.isMobileView()) {
            this.navState.mobileMenuOpen.set(false);
            this.mobileButtonRef()?.nativeElement.focus();
          } else {
            this.focusL1Button(l1Id);
          }
        }
        break;
      }
    }
  }

  protected focusL1Button(l1Id: string): void {
    const el = this.document.getElementById(`l1-btn-${l1Id}`);
    if (el instanceof HTMLElement) {
      el.focus();
    }
  }

  protected focusSearchToggle(): void {
    this.searchToggleRef()?.nativeElement.focus();
  }

  protected focusLogo(): void {
    this.logoLinkRef()?.nativeElement.focus();
  }
}
