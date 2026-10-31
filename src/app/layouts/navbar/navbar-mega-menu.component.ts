import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavCategory } from '../../core/models/navigation.models';
import { NavigationStateService } from '../../core/services/navigation-state.service';
import { UiIconComponent } from '../../shared/components/icons/ui-icon.component';

@Component({
  selector: 'app-navbar-mega-menu',
  imports: [RouterLink, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="l2-wrapper">
      @for (l1 of categories(); track l1.id; let l1Index = $index) {
        @let isL1Open = navState.activeL1Id() === l1.id;
        @let l2ContainerId = 'l2-' + l1.id;
        @let l1ButtonId = 'l1-btn-' + l1.id;

        <div
          [id]="l2ContainerId"
          class="l2-container"
          [attr.aria-hidden]="isL1Open ? 'false' : 'true'"
          [attr.aria-labelledby]="l1ButtonId"
        >
          <button
            type="button"
            class="mobile-back-button"
            [attr.tabindex]="navState.activeL2Id() ? -1 : null"
            (click)="onMobileL2Back(l1.id)"
          >
            <span class="mobile-back-chevron" aria-hidden="true">
              <app-ui-icon name="chevron-left" [size]="16" />
            </span>
            All
          </button>
          <span class="mobile-navigation-title">{{ l1.label }}</span>

          <div class="nav-section">
            <div class="l2-left-rail">
              <ul role="menu" [attr.aria-label]="l1.label">
                @for (l2 of l1.subcategories; track l2.id; let l2Index = $index) {
                  @let isL2Open = isL1Open && navState.activeL2Id() === l2.id;
                  @let skipTab =
                    isL1Open && navState.activeL2Id() !== null && navState.activeL2Id() !== l2.id;

                  <li class="nav-section-heading" role="none">
                    <button
                      [id]="'l2-btn-' + l2.id"
                      type="button"
                      role="menuitem"
                      [attr.aria-expanded]="isL2Open ? 'true' : 'false'"
                      [attr.aria-controls]="'l3-' + l2.id"
                      [tabIndex]="!isL1Open || skipTab ? -1 : 0"
                      (click)="navState.toggleL2(l2.id)"
                      (keydown)="onL2KeyDown($event, l1Index, l2Index)"
                    >
                      <span>{{ l2.label }}</span>
                      <span class="l2-chevron" aria-hidden="true">
                        <app-ui-icon name="chevron-right" [size]="14" />
                      </span>
                    </button>
                  </li>
                }
              </ul>
            </div>

            <div class="l2-right-rail">
              @for (l2 of l1.subcategories; track l2.id; let l2Index = $index) {
                @let isL2Open = isL1Open && navState.activeL2Id() === l2.id;

                <div
                  [id]="'l3-' + l2.id"
                  class="l3-container"
                  [attr.aria-hidden]="isL2Open ? 'false' : 'true'"
                >
                  <div class="nav-sub-section">
                    <button
                      type="button"
                      class="mobile-back-button"
                      [tabIndex]="isL2Open ? 0 : -1"
                      (click)="onMobileL3Back(l2.id)"
                    >
                      <span class="mobile-back-chevron" aria-hidden="true">
                        <app-ui-icon name="chevron-left" [size]="16" />
                      </span>
                      {{ l1.label }}
                    </button>
                    <span class="mobile-navigation-title">{{ l2.label }}</span>

                    <ul role="menu" [attr.aria-label]="l2.label">
                      @for (l3 of l2.items; track l3.href; let l3Index = $index) {
                        <li role="none">
                          <div class="link-teaser forced-light-mode">
                            <div class="cmp-link-teaser">
                              @if (l3.external) {
                                <a
                                  [id]="'l3-link-' + l2.id + '-' + l3Index"
                                  class="cmp-link-teaser__cta"
                                  role="menuitem"
                                  [href]="l3.href"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  [tabIndex]="isL2Open ? 0 : -1"
                                  (keydown)="onL3KeyDown($event, l1Index, l2Index, l3Index)"
                                >
                                  <div class="cmp-link-teaser__title-container">
                                    <span class="cmp-link-teaser__title">{{ l3.label }}</span>
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
                                  [id]="'l3-link-' + l2.id + '-' + l3Index"
                                  class="cmp-link-teaser__cta"
                                  role="menuitem"
                                  [routerLink]="l3.href"
                                  [tabIndex]="isL2Open ? 0 : -1"
                                  (click)="navState.closeImmediate()"
                                  (keydown)="onL3KeyDown($event, l1Index, l2Index, l3Index)"
                                >
                                  <div class="cmp-link-teaser__title-container">
                                    <span class="cmp-link-teaser__title">{{ l3.label }}</span>
                                  </div>
                                </a>
                              }
                            </div>
                          </div>
                        </li>
                      }
                    </ul>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class NavbarMegaMenuComponent {
  protected readonly navState = inject(NavigationStateService);
  private readonly document = inject(DOCUMENT);

  readonly categories = input.required<readonly NavCategory[]>();
  readonly focusL1Requested = output<string>();
  readonly focusSearchToggleRequested = output<void>();

  focusFirstL2(l1Id: string): void {
    const category = this.categories().find((c) => c.id === l1Id);
    const firstL2 = category?.subcategories[0];
    if (firstL2) {
      this.focusById(`l2-btn-${firstL2.id}`);
    }
  }

  focusL2Button(l2Id: string): void {
    this.focusById(`l2-btn-${l2Id}`);
  }

  protected onMobileL2Back(l1Id: string): void {
    this.focusL1Requested.emit(l1Id);
    this.navState.closeL1();
  }

  protected onMobileL3Back(l2Id: string): void {
    this.navState.closeL2();
    this.focusL2Button(l2Id);
  }

  protected onL2KeyDown(event: KeyboardEvent, l1Index: number, l2Index: number): void {
    const cats = this.categories();
    const l1Item = cats[l1Index];
    if (!l1Item) return;
    const l2List = l1Item.subcategories;
    const l2Item = l2List[l2Index];
    if (!l2Item) return;

    switch (event.key) {
      case 'Escape':
      case 'Esc': {
        event.preventDefault();
        event.stopPropagation();
        this.navState.closeL1();
        this.focusL1Requested.emit(l1Item.id);
        break;
      }
      case 'ArrowUp':
      case 'Up': {
        event.preventDefault();
        const prevL2 = l2Index > 0 ? l2List[l2Index - 1] : undefined;
        if (prevL2) {
          this.focusL2Button(prevL2.id);
        } else {
          this.focusL1Requested.emit(l1Item.id);
        }
        break;
      }
      case 'ArrowDown':
      case 'Down': {
        event.preventDefault();
        this.navState.closeL2();
        const nextL2 = l2List[l2Index + 1];
        const nextL1 = cats[l1Index + 1];
        if (nextL2) {
          this.focusL2Button(nextL2.id);
        } else if (nextL1) {
          this.navState.activeL1Id.set(nextL1.id);
          this.focusL1Requested.emit(nextL1.id);
        } else {
          this.navState.closeL1();
          this.focusSearchToggleRequested.emit();
        }
        break;
      }
      case 'ArrowLeft':
      case 'Left': {
        event.preventDefault();
        if (this.navState.activeL2Id() !== l2Item.id) {
          this.navState.closeL2();
          const prevL2 = l2Index > 0 ? l2List[l2Index - 1] : undefined;
          if (prevL2) {
            this.focusL2Button(prevL2.id);
          } else {
            this.focusL1Requested.emit(l1Item.id);
          }
        }
        break;
      }
      case 'ArrowRight':
      case 'Right': {
        event.preventDefault();
        if (this.navState.activeL2Id() !== l2Item.id) {
          this.navState.openL2(l2Item.id);
        } else {
          this.focusById(`l3-link-${l2Item.id}-0`);
        }
        break;
      }
      case 'Tab': {
        if (!event.shiftKey && this.navState.activeL2Id() === l2Item.id) {
          event.preventDefault();
          this.focusById(`l3-link-${l2Item.id}-0`);
        }
        break;
      }
    }
  }

  protected onL3KeyDown(
    event: KeyboardEvent,
    l1Index: number,
    l2Index: number,
    l3Index: number,
  ): void {
    const l1Item = this.categories()[l1Index];
    if (!l1Item) return;
    const l2List = l1Item.subcategories;
    const l2Item = l2List[l2Index];
    if (!l2Item) return;

    const length = l2Item.items.length;
    const columnItemCount = Math.ceil(length / 2);

    switch (event.key) {
      case 'Escape':
      case 'Esc': {
        event.preventDefault();
        event.stopPropagation();
        this.navState.closeL2();
        this.focusL2Button(l2Item.id);
        break;
      }
      case 'ArrowUp':
      case 'Up': {
        event.preventDefault();
        if (l3Index > 0) {
          this.focusById(`l3-link-${l2Item.id}-${l3Index - 1}`);
        } else {
          this.focusL2Button(l2Item.id);
        }
        break;
      }
      case 'ArrowDown':
      case 'Down': {
        event.preventDefault();
        const nextL2 = l2List[l2Index + 1];
        if (l3Index + 1 < length) {
          this.focusById(`l3-link-${l2Item.id}-${l3Index + 1}`);
        } else if (nextL2) {
          this.navState.closeL2();
          this.focusL2Button(nextL2.id);
        }
        break;
      }
      case 'ArrowRight':
      case 'Right': {
        event.preventDefault();
        const rightColIdx = l3Index + columnItemCount;
        const nextL2 = l2List[l2Index + 1];
        if (l3Index + 1 < columnItemCount && rightColIdx < length) {
          this.focusById(`l3-link-${l2Item.id}-${rightColIdx}`);
        } else if (l3Index + 1 === columnItemCount) {
          this.focusById(`l3-link-${l2Item.id}-${length - 1}`);
        } else if (nextL2) {
          this.navState.closeL2();
          this.focusL2Button(nextL2.id);
        }
        break;
      }
      case 'ArrowLeft':
      case 'Left': {
        event.preventDefault();
        if (l3Index + 1 > columnItemCount) {
          this.focusById(`l3-link-${l2Item.id}-${l3Index - columnItemCount}`);
        } else {
          this.focusL2Button(l2Item.id);
        }
        break;
      }
    }
  }

  private focusById(id: string): void {
    const el = this.document.getElementById(id);
    if (el instanceof HTMLElement) {
      el.focus();
    }
  }
}
