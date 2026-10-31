import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FEATURED_CONTENT_HEADING,
  FEATURED_CONTENT_ITEMS,
  POPULAR_SEARCH_LINKS,
  SEARCH_PROMPT_HEADING,
} from '../../core/data/navigation.data';
import { NavigationStateService } from '../../core/services/navigation-state.service';
import { ViewportService } from '../../core/services/viewport.service';
import { UiIconComponent } from '../../shared/components/icons/ui-icon.component';

@Component({
  selector: 'app-navbar-search-panel',
  imports: [RouterLink, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      id="search-content"
      class="navigation-bar__search-content"
      [attr.aria-hidden]="navState.searchOpen() ? 'false' : 'true'"
    >
      <div class="instant-search-comp__searchbox-wrap">
        <div id="autocomplete">
          <div
            class="aa-Autocomplete"
            role="combobox"
            [attr.aria-expanded]="navState.searchOpen() ? 'true' : 'false'"
            aria-haspopup="listbox"
            aria-controls="autocomplete-0-list"
            aria-owns="autocomplete-0-list"
          >
            <form
              class="aa-Form"
              action="/search"
              role="search"
              novalidate
              (submit)="onSearchSubmit($event)"
            >
              <div class="aa-InputWrapperPrefix">
                <label class="aa-Label" for="autocomplete-0-input" id="autocomplete-0-label">
                  <button class="aa-SubmitButton" type="submit" title="Submit">
                    <app-ui-icon name="search" [size]="16" />
                  </button>
                </label>
              </div>
              <div class="aa-InputWrapper">
                <input
                  #searchInput
                  class="aa-Input"
                  id="autocomplete-0-input"
                  type="search"
                  placeholder="Search"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  maxlength="512"
                  aria-autocomplete="list"
                  aria-controls="autocomplete-0-list"
                  aria-labelledby="autocomplete-0-label"
                  [attr.aria-activedescendant]="navState.activeDescendantId()"
                  [tabIndex]="navState.searchOpen() ? 0 : -1"
                  [value]="navState.searchQuery()"
                  (input)="onSearchInput($event)"
                  (keydown)="onSearchInputKeyDown($event)"
                />
              </div>
              <div class="aa-InputWrapperSuffix">
                <button
                  class="aa-ClearButton"
                  type="reset"
                  title="Clear"
                  [hidden]="!navState.searchQuery()"
                  (click)="clearSearch()"
                >
                  <app-ui-icon name="close" [size]="14" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="search-content">
        <!-- Pre-Query State: Quick Links + Featured from Decaspark -->
        <div class="plugin_prequery pre-query" [hidden]="navState.trimmedQuery().length > 0">
          <div class="pre-query__grid">
            <div class="pre-query__left">
              <div class="title ds-title__pre">
                <div class="cmp-title">
                  <h2 class="cmp-title__text">
                    <span class="cmp-pretitle-icon" aria-hidden="true"></span>
                    {{ searchPromptHeading }}
                  </h2>
                </div>
              </div>

              @for (item of popularSearchLinks; track item.href) {
                <div class="button ds-cta__tertiary">
                  <a
                    class="cmp-button"
                    [routerLink]="item.href"
                    [tabIndex]="
                      navState.searchOpen() && navState.trimmedQuery().length === 0 ? 0 : -1
                    "
                    (click)="navState.closeImmediate()"
                  >
                    <span class="cmp-button__text">{{ item.label }}</span>
                  </a>
                </div>
              }
            </div>

            <div class="pre-query__right">
              <div class="title ds-title__pre">
                <div class="cmp-title">
                  <h2 class="cmp-title__text">
                    <span class="cmp-pretitle-icon" aria-hidden="true"></span>
                    {{ featuredContentHeading }}
                  </h2>
                </div>
              </div>

              @for (item of featuredContentItems; track item.title) {
                <div class="teaser ds-side-bar">
                  <div class="cmp-teaser">
                    @if (item.external) {
                      <a
                        class="cmp-teaser__link"
                        [href]="item.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        [tabIndex]="
                          navState.searchOpen() && navState.trimmedQuery().length === 0 ? 0 : -1
                        "
                      >
                        <div class="cmp-teaser__content">
                          <h3 class="cmp-teaser__title">{{ item.title }}</h3>
                          <div class="cmp-teaser__description">
                            <p>{{ item.description }}</p>
                          </div>
                        </div>
                        <app-ui-icon
                          name="diagonal-arrow"
                          [size]="14"
                          svgClass="ds-external-icon"
                        />
                        <span class="sr-only">opens in a new tab</span>
                      </a>
                    } @else {
                      <a
                        class="cmp-teaser__link"
                        [routerLink]="item.href"
                        [tabIndex]="
                          navState.searchOpen() && navState.trimmedQuery().length === 0 ? 0 : -1
                        "
                        (click)="navState.closeImmediate()"
                      >
                        <div class="cmp-teaser__content">
                          <h3 class="cmp-teaser__title">{{ item.title }}</h3>
                          <div class="cmp-teaser__description">
                            <p>{{ item.description }}</p>
                          </div>
                        </div>
                      </a>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Mid-Query State: Live Search Suggestions + View Results -->
        <div class="mid-query" [hidden]="navState.trimmedQuery().length === 0">
          <div class="mid-query__container cmp-container">
            @if (navState.filteredHits().length > 0) {
              <div class="aa-Panel">
                <div class="default-state">
                  <ul
                    id="autocomplete-0-list"
                    class="aa-List"
                    role="listbox"
                    aria-label="Search suggestions"
                  >
                    @for (hit of navState.filteredHits(); track hit.href; let idx = $index) {
                      <li
                        [id]="'autocomplete-hit-' + idx"
                        class="aa-Item"
                        role="option"
                        [attr.aria-selected]="navState.activeHitIndex() === idx ? 'true' : 'false'"
                        [attr.data-active]="navState.activeHitIndex() === idx ? 'true' : 'false'"
                      >
                        <span class="aa-ItemIcon" aria-hidden="true">
                          <app-ui-icon name="curved-right-arrow" [size]="12" />
                        </span>
                        <div class="ds-search-result">
                          @if (hit.external) {
                            <a
                              class="hit-card"
                              [href]="hit.href"
                              target="_blank"
                              rel="noopener noreferrer"
                              [tabIndex]="
                                navState.searchOpen() && navState.trimmedQuery().length > 0 ? 0 : -1
                              "
                            >
                              <span>{{ hit.title }}</span>
                            </a>
                          } @else {
                            <a
                              class="hit-card"
                              [routerLink]="hit.href"
                              [tabIndex]="
                                navState.searchOpen() && navState.trimmedQuery().length > 0 ? 0 : -1
                              "
                              (click)="navState.closeImmediate()"
                            >
                              <span>{{ hit.title }}</span>
                            </a>
                          }
                        </div>
                      </li>
                    }
                  </ul>
                  <button
                    #searchSubmitButton
                    type="button"
                    class="search-submit"
                    [tabIndex]="
                      navState.searchOpen() && navState.trimmedQuery().length > 0 ? 0 : -1
                    "
                    (click)="onViewResultsClick()"
                    (keydown)="onSearchSubmitKeyDown($event)"
                  >
                    View Results
                  </button>
                </div>
              </div>
            } @else {
              <div class="aa-Panel">
                <p class="no-results-header">No Results Found.</p>
                <p class="no-results-body">Please try again with a different search query.</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NavbarSearchPanelComponent {
  protected readonly navState = inject(NavigationStateService);
  private readonly viewport = inject(ViewportService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly searchPromptHeading = SEARCH_PROMPT_HEADING;
  protected readonly popularSearchLinks = POPULAR_SEARCH_LINKS;
  protected readonly featuredContentHeading = FEATURED_CONTENT_HEADING;
  protected readonly featuredContentItems = FEATURED_CONTENT_ITEMS;

  readonly focusSearchToggleRequested = output<void>();
  readonly focusLogoRequested = output<void>();

  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly searchSubmitRef = viewChild<ElementRef<HTMLButtonElement>>('searchSubmitButton');

  constructor() {
    effect(() => {
      if (this.navState.searchOpen() && isPlatformBrowser(this.platformId)) {
        const win = this.document.defaultView;
        win?.requestAnimationFrame(() => {
          this.focusInput();
        });
      }
    });
  }

  focusInput(): void {
    this.searchInputRef()?.nativeElement.focus();
  }

  protected onSearchInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.navState.setSearchQuery(target.value);
    }
  }

  protected clearSearch(): void {
    this.navState.setSearchQuery('');
    this.focusInput();
  }

  protected onSearchSubmit(event: Event): void {
    event.preventDefault();
    const activeIdx = this.navState.activeHitIndex();
    const hits = this.navState.filteredHits();
    const activeHit = activeIdx >= 0 && activeIdx < hits.length ? hits[activeIdx] : undefined;

    if (activeHit) {
      if (activeHit.external && isPlatformBrowser(this.platformId)) {
        this.document.defaultView?.open(activeHit.href, '_blank', 'noopener,noreferrer');
        this.navState.closeImmediate();
      } else {
        void this.router.navigateByUrl(activeHit.href);
      }
      return;
    }

    const q = this.navState.trimmedQuery();
    void this.router.navigate(['/search'], {
      queryParams: q ? { q } : {},
    });
  }

  protected onViewResultsClick(): void {
    const q = this.navState.trimmedQuery();
    void this.router.navigate(['/search'], {
      queryParams: q ? { q } : {},
    });
  }

  protected onSearchInputKeyDown(event: KeyboardEvent): void {
    const inputEl = event.currentTarget;
    if (!(inputEl instanceof HTMLInputElement)) return;

    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      event.stopPropagation();
      this.navState.closeSearchAnimated();
      this.focusSearchToggleRequested.emit();
      return;
    }

    if (event.key === 'ArrowRight' && inputEl.selectionStart === inputEl.value.length) {
      event.preventDefault();
      this.focusSearchToggleRequested.emit();
      return;
    }

    if (
      event.key === 'ArrowLeft' &&
      inputEl.selectionStart === 0 &&
      !this.viewport.isMobileView()
    ) {
      event.preventDefault();
      this.focusLogoRequested.emit();
      return;
    }

    if (!this.navState.trimmedQuery()) return;

    const hits = this.navState.filteredHits();
    const currentIdx = this.navState.activeHitIndex();

    if (event.key === 'ArrowDown' || event.key === 'Down') {
      event.preventDefault();
      if (hits.length === 0) {
        this.navState.activeHitIndex.set(-1);
        this.searchSubmitRef()?.nativeElement.focus();
      } else if (currentIdx < hits.length - 1) {
        this.navState.activeHitIndex.set(currentIdx + 1);
      } else {
        this.navState.activeHitIndex.set(-1);
        this.searchSubmitRef()?.nativeElement.focus();
      }
    } else if (event.key === 'ArrowUp' || event.key === 'Up') {
      event.preventDefault();
      if (currentIdx > 0) {
        this.navState.activeHitIndex.set(currentIdx - 1);
      } else if (currentIdx === 0) {
        this.navState.activeHitIndex.set(-1);
      } else {
        this.searchSubmitRef()?.nativeElement.focus();
      }
    }
  }

  protected onSearchSubmitKeyDown(event: KeyboardEvent): void {
    const hits = this.navState.filteredHits();
    if (event.key === 'ArrowUp' || event.key === 'Up') {
      event.preventDefault();
      this.focusInput();
      if (hits.length > 0) {
        this.navState.activeHitIndex.set(hits.length - 1);
      }
    } else if (event.key === 'ArrowDown' || event.key === 'Down') {
      event.preventDefault();
      this.focusInput();
      this.navState.activeHitIndex.set(-1);
    }
  }
}
