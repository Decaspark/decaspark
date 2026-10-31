import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  RESPONSE_INIT,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { resolveCatalogRoute } from '../../core/data/navigation.data';
import { NavSubcategory, ResolvedCatalogRoute } from '../../core/models/navigation.models';
import { SeoService } from '../../core/services/seo.service';
import { PillarDirectoryComponent } from '../../shared/components/pillar-directory/pillar-directory.component';
import { UiIconComponent } from '../../shared/components/icons/ui-icon.component';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, UiIconComponent, PillarDirectoryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      id="main-content"
      tabindex="-1"
      class="mx-auto max-w-[1392px] px-5 pt-24 pb-20 outline-none md:px-12 min-[940px]:pt-44"
    >
      @if (resolvedRoute(); as route) {
        <!-- Breadcrumb -->
        <nav aria-label="Breadcrumb" class="mb-6">
          <ol class="m-0 flex flex-wrap items-center gap-2 p-0 list-none text-sm text-[#555250]">
            <li>
              <a
                routerLink="/"
                class="text-[#555250] no-underline hover:text-[#141413] hover:underline"
              >
                Home
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span class="font-medium text-[#141413]">{{ route.category.label }}</span>
            </li>
            @if (route.activeSubcategory; as sub) {
              <li aria-hidden="true">/</li>
              <li>
                <span class="text-[#141413]">{{ sub.label }}</span>
              </li>
            }
          </ol>
        </nav>

        <!-- Header Card -->
        <section class="rounded-[28px] bg-white p-8 md:rounded-[40px] md:p-12">
          <div class="title ds-title__pre">
            <p class="cmp-title__text">
              <span class="cmp-pretitle-icon" aria-hidden="true"></span>
              {{ route.eyebrow }}
            </p>
          </div>

          <h1
            class="m-0 max-w-3xl text-3xl font-medium leading-[1.12] tracking-[-0.03em] text-[#141413] md:text-5xl"
          >
            {{ route.heading }}
          </h1>

          <p class="mt-4 mb-0 max-w-2xl text-base leading-relaxed text-[#555250] md:text-lg">
            {{ route.description }}
          </p>
        </section>

        <!-- Subcategories & Preserved Catalog Links -->
        <section class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2" aria-label="Directory items">
          @for (sub of displayedSubcategories(); track sub.id) {
            <article class="rounded-[24px] bg-white p-7 md:rounded-[32px] md:p-9">
              <h2 class="m-0 text-xl font-medium tracking-[-0.02em] text-[#141413] md:text-2xl">
                {{ sub.label }}
              </h2>

              <ul class="mt-5 m-0 flex list-none flex-col gap-2 p-0">
                @for (item of sub.items; track item.href) {
                  @let isCurrent = route.path === item.href;
                  <li>
                    @if (item.external) {
                      <a
                        [href]="item.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center justify-between rounded-[16px] px-4 py-3 text-base font-medium text-[#141413] no-underline transition-colors hover:bg-[#f3f0ee]"
                      >
                        <span>{{ item.label }}</span>
                        <app-ui-icon name="diagonal-arrow" [size]="14" />
                        <span class="sr-only">opens in a new tab</span>
                      </a>
                    } @else {
                      <a
                        [routerLink]="item.href"
                        [attr.aria-current]="isCurrent ? 'page' : null"
                        class="flex items-center justify-between rounded-[16px] px-4 py-3 text-base font-medium no-underline transition-colors"
                        [class.bg-[#f3f0ee]]="isCurrent"
                        [class.text-[#141413]]="true"
                        [class.hover:bg-[#f3f0ee]]="!isCurrent"
                      >
                        <span>{{ item.label }}</span>
                        <app-ui-icon name="chevron-right" [size]="14" />
                      </a>
                    }
                  </li>
                }
              </ul>
            </article>
          }
        </section>

        <!-- Deferred Cross-Pillar Directory (loads lazily with zero layout shift) -->
        @defer (on idle) {
          <app-pillar-directory [excludeCategoryId]="route.category.id" />
        } @placeholder {
          <div class="mt-14 min-h-[220px] border-t border-[#e8e5e1] pt-10" aria-hidden="true"></div>
        }
      } @else {
        <!-- Unknown Sub-Path: 404 State -->
        <section class="rounded-[28px] bg-white p-8 md:rounded-[40px] md:p-12">
          <div class="title ds-title__pre">
            <p class="cmp-title__text">
              <span class="cmp-pretitle-icon" aria-hidden="true"></span>
              404 · Page Not Found
            </p>
          </div>
          <h1 class="m-0 text-3xl font-medium tracking-[-0.03em] text-[#141413] md:text-5xl">
            This page could not be found.
          </h1>
          <p class="mt-4 mb-8 max-w-xl text-base text-[#555250]">
            The requested address does not match an active Decaspark catalog route. Use the
            navigation bar or search above, or return to the home page.
          </p>
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 rounded-[99px] bg-[#141413] px-6 py-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-85"
          >
            Return to Decaspark Home
          </a>
        </section>
      }
    </main>
  `,
})
export class CatalogPageComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly seo = inject(SeoService);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  private readonly currentUrl = signal<string>(this.router.url);

  protected readonly resolvedRoute = computed<ResolvedCatalogRoute | null>(() =>
    resolveCatalogRoute(this.currentUrl()),
  );

  protected readonly displayedSubcategories = computed<readonly NavSubcategory[]>(() => {
    const route = this.resolvedRoute();
    if (!route) return [];
    if (route.activeSubcategory) {
      const others = route.category.subcategories.filter(
        (sub) => sub.id !== route.activeSubcategory?.id,
      );
      return [route.activeSubcategory, ...others];
    }
    return route.category.subcategories;
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });

    effect(() => {
      const route = this.resolvedRoute();
      if (route) {
        this.seo.update({
          title: `${route.heading} — Decaspark`,
          description: route.description,
          path: route.path,
        });
      } else {
        if (this.responseInit) {
          this.responseInit.status = 404;
        }
        this.seo.update({
          title: 'Page Not Found — Decaspark',
          description: 'The requested page could not be found on Decaspark.',
          path: this.currentUrl(),
          noindex: true,
        });
      }
    });
  }
}
