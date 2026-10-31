import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiIconName =
  'search' | 'close' | 'chevron-right' | 'chevron-left' | 'diagonal-arrow' | 'curved-right-arrow';

@Component({
  selector: 'app-ui-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
  `,
  template: `
    <svg
      [attr.class]="svgClass() || null"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name()) {
        @case ('search') {
          <path
            d="M9.083 0a9.083 9.083 0 016.936 14.948L24 22.93 22.93 24l-7.982-7.981A9.083 9.083 0 119.083 0zm.093 1.412a7.765 7.765 0 100 15.53 7.765 7.765 0 000-15.53z"
            fill="currentColor"
            fill-rule="evenodd"
            stroke="currentColor"
            stroke-width="0.45"
          />
        }
        @case ('close') {
          <path
            d="M22.938 0L24 1.062 13.061 12 24 22.938 22.938 24 12 13.061 1.062 24 0 22.938 10.938 12 0 1.062 1.062 0 12 10.938 22.938 0z"
            fill="currentColor"
            fill-rule="evenodd"
          />
        }
        @case ('chevron-right') {
          <path
            d="M5 22.753L6.252 24l11.96-12L6.253 0 5 1.247 15.717 12z"
            fill="currentColor"
            fill-rule="evenodd"
          />
        }
        @case ('chevron-left') {
          <path
            d="M18.213 22.753L16.96 24 5 12 16.96 0l1.253 1.247L7.495 12z"
            fill="currentColor"
            fill-rule="evenodd"
          />
        }
        @case ('diagonal-arrow') {
          <path d="M7 5h12v12h-1.6V7.73L5.63 19.5 4.5 18.37 16.27 6.6H7V5z" fill="currentColor" />
        }
        @case ('curved-right-arrow') {
          <path
            d="M4 3h1.75v8.25A3.75 3.75 0 009.5 15h9.63l-4.2-4.2 1.24-1.24L22.5 15.9l-6.33 6.33-1.24-1.24 4.2-4.24H9.5A5.5 5.5 0 014 11.25V3z"
            fill="currentColor"
          />
        }
      }
    </svg>
  `,
})
export class UiIconComponent {
  readonly name = input.required<UiIconName>();
  readonly size = input<number>(16);
  readonly svgClass = input<string>('');
}
