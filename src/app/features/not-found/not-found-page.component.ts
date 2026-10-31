import { ChangeDetectionStrategy, Component, RESPONSE_INIT, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
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
            404 · Page Not Found
          </p>
        </div>

        <h1 class="m-0 text-3xl font-medium tracking-[-0.03em] text-[#141413] md:text-5xl">
          This page could not be found.
        </h1>

        <p class="mt-4 mb-8 max-w-xl text-base text-[#555250]">
          The requested address does not exist on Decaspark. Use the navigation bar or instant
          search above, or return to the home page.
        </p>

        <div class="flex flex-wrap gap-3">
          <a
            routerLink="/"
            class="inline-flex items-center rounded-[99px] bg-[#141413] px-6 py-3 text-sm font-medium text-white no-underline transition-opacity hover:opacity-85"
          >
            Return to Home
          </a>
          <a
            routerLink="/search"
            class="inline-flex items-center rounded-[99px] border border-[#262627] bg-white px-6 py-3 text-sm font-medium text-[#141413] no-underline transition-colors hover:bg-[#f3f0ee]"
          >
            Search Decaspark
          </a>
        </div>
      </section>
    </main>
  `,
})
export class NotFoundPageComponent {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  constructor() {
    if (this.responseInit) {
      this.responseInit.status = 404;
    }
    this.seo.update({
      title: 'Page Not Found — Decaspark',
      description: 'The requested page could not be found on Decaspark.',
      path: this.router.url,
      noindex: true,
    });
  }
}
