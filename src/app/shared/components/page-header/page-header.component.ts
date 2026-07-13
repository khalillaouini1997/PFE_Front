import {Component, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="premium-card mb-4 header-gradient shadow-sm p-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div class="title-section">
          <h2 class="m-0 fw-bold">{{ titleKey() | translate }}</h2>
          @if (subtitleKey()) {
            <p class="m-0 subtitle-text">{{ subtitleKey()! | translate }}</p>
          }
        </div>
        <div class="controls-section d-flex align-items-center gap-3">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  titleKey = input.required<string>();
  subtitleKey = input<string>();
}
