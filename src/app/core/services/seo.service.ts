import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PageSeoMetadata } from '../models/navigation.models';

const DEFAULT_ORIGIN = 'https://decaspark.com';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(metadata: PageSeoMetadata): void {
    const normalizedPath = metadata.path.startsWith('/') ? metadata.path : `/${metadata.path}`;
    const canonicalUrl = `${DEFAULT_ORIGIN}${normalizedPath === '/' ? '' : normalizedPath}`;

    this.title.setTitle(metadata.title);
    this.meta.updateTag({ name: 'description', content: metadata.description });
    this.meta.updateTag({ property: 'og:title', content: metadata.title });
    this.meta.updateTag({ property: 'og:description', content: metadata.description });
    this.meta.updateTag({ property: 'og:type', content: metadata.type ?? 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: '/images/decaspark-emblem.png' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({
      name: 'robots',
      content: metadata.noindex ? 'noindex, nofollow' : 'index, follow',
    });

    if (!metadata.noindex) {
      this.setCanonicalLink(canonicalUrl);
    } else {
      this.removeCanonicalLink();
    }
  }

  private setCanonicalLink(href: string): void {
    const head = this.document.head;
    if (!head) return;

    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private removeCanonicalLink(): void {
    const link = this.document.head?.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    link?.remove();
  }
}
