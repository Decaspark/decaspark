import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

const MODAL_OPEN_CLASS = 'modal-open';

@Injectable({ providedIn: 'root' })
export class ScrollLockService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private savedScrollY = 0;

  setLocked(locked: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const body = this.document.body;
    const win = this.document.defaultView;
    if (!body || !win) {
      return;
    }

    if (locked) {
      if (!body.classList.contains(MODAL_OPEN_CLASS)) {
        this.savedScrollY = win.scrollY;
        body.classList.add(MODAL_OPEN_CLASS);
        body.style.top = `-${this.savedScrollY}px`;
        body.style.position = 'fixed';
        body.style.width = '100%';
      }
    } else if (body.classList.contains(MODAL_OPEN_CLASS)) {
      body.classList.remove(MODAL_OPEN_CLASS);
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      try {
        win.scrollTo(0, this.savedScrollY);
      } catch {
        // Non-scrolling DOM test environments (e.g., jsdom) omit scrollTo implementation
      }
    }
  }
}
