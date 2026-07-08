import { Component, inject, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ErrorBannerComponent, ErrorBannerData } from './shared/components/error-banner/error-banner.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ErrorBannerComponent],
    templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'web_admin';
  private readonly translate = inject(TranslateService);
  
  @ViewChild(ErrorBannerComponent) errorBanner?: ErrorBannerComponent;

  constructor() {
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('fr');

    const browserLang = localStorage.getItem('language') || this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/fr|en/) ? browserLang : 'fr');
  }

  ngAfterViewInit() {
    // Listen for error banner events from interceptors
    window.addEventListener('show-error-banner', this.handleShowErrorBanner);
  }

  ngOnDestroy() {
    window.removeEventListener('show-error-banner', this.handleShowErrorBanner);
  }

  private handleShowErrorBanner = (event: Event) => {
    const customEvent = event as CustomEvent<ErrorBannerData>;
    if (this.errorBanner && customEvent.detail) {
      this.errorBanner.showError(customEvent.detail);
    }
  };
}
