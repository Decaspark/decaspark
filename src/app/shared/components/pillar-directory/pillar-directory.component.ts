import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAVIGATION_CATEGORIES } from '../../../core/data/navigation.data';
import { NavCategory } from '../../../core/models/navigation.models';

@Component({
  selector: 'app-pillar-directory',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="mt-14 border-t border-[#e8e5e1] pt-10"
      aria-labelledby="more-from-decaspark-heading"
    >
      <div class="title ds-title__pre">
        <h2 id="more-from-decaspark-heading" class="cmp-title__text">
          <span class="cmp-pretitle-icon" aria-hidden="true"></span>
          Explore Decaspark Sections
        </h2>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @for (cat of siblingCategories(); track cat.id) {
          <div class="rounded-[24px] bg-white p-6">
            <h3 class="m-0 text-lg font-medium tracking-[-0.02em] text-[#141413]">
              {{ cat.label }}
            </h3>
            <ul class="mt-4 flex list-none flex-col gap-2.5 p-0">
              @for (sub of cat.subcategories; track sub.id) {
                @let firstInternal = firstInternalItemHref(sub.items);
                @if (firstInternal) {
                  <li>
                    <a
                      [routerLink]="firstInternal"
                      class="text-sm font-medium text-[#555250] no-underline transition-colors hover:text-[#141413] hover:underline"
                    >
                      {{ sub.label }}
                    </a>
                  </li>
                }
              }
            </ul>
          </div>
        }
      </div>
    </section>
  `,
})
export class PillarDirectoryComponent {
  readonly excludeCategoryId = input<string | null>(null);

  protected readonly siblingCategories = computed<readonly NavCategory[]>(() => {
    const excluded = this.excludeCategoryId();
    return excluded
      ? NAVIGATION_CATEGORIES.filter((cat) => cat.id !== excluded)
      : NAVIGATION_CATEGORIES;
  });

  protected firstInternalItemHref(
    items: readonly { readonly href: string; readonly external?: boolean }[],
  ): string | null {
    const match = items.find((i) => !i.external);
    return match ? match.href : null;
  }
}
