import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main-content" class="ds-empty-page" tabindex="-1">
      <h1 class="sr-only">
        Decaspark | Digital Products, Publications, Content &amp; Team Automation
      </h1>
    </main>
  `,
})
export class HomePageComponent {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.update({
      title: 'Decaspark | Digital Products, Publications, Content & Team Automation',
      description:
        'Decaspark builds operating systems, design kits, authored strategy books, editorial production, and custom AI workflow automation for modern teams.',
      path: '/',
    });
  }
}
