import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';

import { environment } from './environments/environment';
import { authInterceptor } from './app/utils/security/auth.interceptor';
import { httpErrorInterceptor } from './app/utils/security/http-error.interceptor';
import { tokenRefreshInterceptor } from './app/utils/security/token-refresh.interceptor';
import { apiResponseInterceptor } from './app/utils/security/api-response.interceptor';
import { bootstrapApplication } from '@angular/platform-browser';
import { routes } from './app/app.routes';
import { NgOptimizedImage } from '@angular/common';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ThemeService } from './app/shared/services/theme.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private readonly http: HttpClient) {}
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

import { ToastrModule } from 'ngx-toastr';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(
      FormsModule,
      NgOptimizedImage,
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
      }),
      NgMultiSelectDropDownModule.forRoot(),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
    ),
    provideHttpClient(withInterceptors([authInterceptor, apiResponseInterceptor, httpErrorInterceptor, tokenRefreshInterceptor])),
    provideAnimations(),
    providePrimeNG({
        theme: {
            preset: Aura,
            options: {
                cssLayer: false,
                darkModeSelector: '[data-theme="dark"]'
            }
        },
        ripple: true
    }),
    {
      provide: 'APP_INITIALIZER',
      useFactory: (themeService: ThemeService) => () => themeService.init(),
      deps: [ThemeService],
      multi: true
    }
  ]
})
  .catch(err => {});
