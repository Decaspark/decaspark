import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-shell',
  imports: [NavbarComponent, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cmp-page__skiptomaincontent">
      <a
        class="cmp-page__skiptomaincontent-link"
        href="#main-content"
        (click)="skipToMainContent($event)"
      >
        Skip to main content
      </a>
    </div>

    <app-navbar />

    <router-outlet />
  `,
})
export class ShellComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  protected skipToMainContent(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const target = this.document.getElementById('main-content');
    if (target instanceof HTMLElement) {
      event.preventDefault();
      target.focus();
      target.scrollIntoView({ behavior: 'auto' });
    }
  }
}
