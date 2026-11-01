import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import {
  FEATURED_CONTENT_HEADING,
  FEATURED_CONTENT_ITEMS,
  POPULAR_SEARCH_LINKS,
  SEARCH_INDEX,
  SEARCH_PROMPT_HEADING,
} from '../../core/data/navigation.data';
import { SearchEntry } from '../../core/models/navigation.models';
import { SeoService } from '../../core/services/seo.service';
import { UiIconComponent } from '../../shared/components/icons/ui-icon.component';
import { PillarDirectoryComponent } from '../../shared/components/pillar-directory/pillar-directory.component';

@Component({
  selector: 'app-search-page',
  imports: [RouterLink, UiIconComponent, PillarDirectoryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      id="main-content"
      tabindex="-1"
      class="mx-auto max-w-[1392px] px-5 pt-24 pb-20 outline-none md:px-12 min-[940px]:pt-44"
    >
      <section class="rounded-[28px] bg-white p-8 md:rounded-[40px] md:p-12">
        <div class="title ds-title__pre">
          <p class="cmp-title__text">
            <span class="cmp-pretitle-icon" aria-hidden="true"></span>
            Decaspark Search
          </p>
        </div>

        <h1
          class="m-0 text-3xl font-medium leading-[1.12] tracking-[-0.03em] text-[#141413] md:text-5xl"
        >
          @if (trimmedQuery()) {
            Results for “{{ trimmedQuery() }}”
          } @else {
            {{ searchPromptHeading }}
          }
        </h1>

        <form
          class="mt-6 flex max-w-2xl items-center gap-3"
          role="search"
          (submit)="onFormSubmit($event)"
        >
          <label for="page-search-input" class="sr-only">Search Decaspark</label>
          <input
            id="page-search-input"
            type="search"
            placeholder="Search products, books, services, and resources"
            [value]="draftQuery()"
            (input)="onQueryInput($event)"
            class="h-12 w-full rounded-[30px] border border-[#262627] bg-white px-6 text-base text-[#141413] placeholder:text-[#96918b] focus:outline-2 focus:outline-offset-2 focus:outline-[#141413]"
          />
          <button
            type="submit"
            class="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-[99px] bg-[#141413] px-6 text-sm font-medium text-white border-0 transition-opacity hover:opacity-85"
          >
            Search
          </button>
        </form>

        @if (trimmedQuery()) {
          <p class="mt-5 mb-0 text-sm text-[#555250]" role="status" aria-live="polite">
            {{ results().length }} matching {{ results().length === 1 ? 'entry' : 'entries' }}
          </p>
        }
      </section>

      @if (trimmedQuery()) {
        <section class="mt-8" aria-label="Search results">
          @if (results().length > 0) {
            <ul class="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
              @for (entry of results(); track entry.id) {
                <li class="rounded-[24px] bg-white p-6">
                  <p class="m-0 text-xs font-bold tracking-[0.04em] uppercase text-[#555250]">
                    {{ entry.section }}
                  </p>
                  @if (entry.external) {
                    <a
                      [href]="entry.href"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="mt-2 inline-flex items-center gap-2 text-xl font-medium text-[#141413] no-underline hover:underline"
                    >
                      <span>{{ entry.title }}</span>
                      <app-ui-icon name="diagonal-arrow" [size]="14" />
                      <span class="sr-only">opens in a new tab</span>
                    </a>
                  } @else {
                    <a
                      [routerLink]="entry.href"
                      class="mt-2 inline-flex items-center gap-2 text-xl font-medium text-[#141413] no-underline hover:underline"
                    >
                      <span>{{ entry.title }}</span>
                      <app-ui-icon name="chevron-right" [size]="14" />
                    </a>
                  }
                </li>
              }
            </ul>
          } @else {
            <div class="rounded-[28px] bg-white p-8 md:p-12">
              <h2 class="m-0 text-2xl font-medium text-[#141413] md:text-3xl">No Results Found.</h2>
              <p class="mt-3 mb-0 text-base text-[#555250]">
                Please try again with a different search query or browse popular sections below.
              </p>
            </div>
          }
        </section>
      } @else {
        <section class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3" aria-label="Popular topics">
          <div class="rounded-[28px] bg-white p-8">
            <h2 class="m-0 text-lg font-bold tracking-[0.03em] uppercase text-[#141413]">
              Popular Destinations
            </h2>
            <ul class="mt-5 m-0 flex list-none flex-col gap-3 p-0">
              @for (item of popularSearchLinks; track item.href) {
                <li>
                  <a
                    [routerLink]="item.href"
                    class="text-base font-medium text-[#141413] underline-offset-4 hover:text-[#555250] hover:underline"
                  >
                    {{ item.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <div class="flex flex-col gap-4 lg:col-span-2">
            @for (feat of featuredContentItems; track feat.href) {
              <div class="rounded-[28px] bg-white p-8">
                <p class="m-0 text-xs font-bold tracking-[0.04em] uppercase text-[#555250]">
                  {{ featuredContentHeading }}
                </p>
                <a
                  [routerLink]="feat.href"
                  class="mt-2 block text-xl font-medium text-[#141413] no-underline hover:underline md:text-2xl"
                >
                  {{ feat.title }}
                </a>
                <p class="mt-2 mb-0 text-base text-[#555250]">{{ feat.description }}</p>
              </div>
            }
          </div>
        </section>
      }

      @defer (on idle) {
        <app-pillar-directory />
      } @placeholder {
        <div class="mt-14 min-h-[220px] border-t border-[#e8e5e1] pt-10" aria-hidden="true"></div>
      }
    </main>
  `,
})
export class SearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  protected readonly searchPromptHeading = SEARCH_PROMPT_HEADING;
  protected readonly popularSearchLinks = POPULAR_SEARCH_LINKS;
  protected readonly featuredContentHeading = FEATURED_CONTENT_HEADING;
  protected readonly featuredContentItems = FEATURED_CONTENT_ITEMS;

  private readonly routeQuery = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: this.route.snapshot.queryParamMap.get('q') ?? '' },
  );

  protected readonly draftQuery = signal<string>(this.routeQuery());

  protected readonly trimmedQuery = computed<string>(() => this.draftQuery().trim());

  protected readonly results = computed<readonly SearchEntry[]>(() => {
    const q = this.trimmedQuery().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter(
      (entry) => entry.title.toLowerCase().includes(q) || entry.keywords.includes(q),
    );
  });

  constructor() {
    effect(() => {
      this.draftQuery.set(this.routeQuery());
    });

    effect(() => {
      const q = this.trimmedQuery();
      this.seo.update({
        title: q ? `Search: ${q} | Decaspark` : 'Search | Decaspark',
        description:
          'Search Decaspark digital operating systems, books, creative studio services, team enablement, and automation resources.',
        path: '/search',
      });
    });
  }

  protected onQueryInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.draftQuery.set(target.value);
    }
  }

  protected onFormSubmit(event: Event): void {
    event.preventDefault();
    const q = this.trimmedQuery();
    void this.router.navigate(['/search'], {
      queryParams: q ? { q } : {},
    });
  }
}
