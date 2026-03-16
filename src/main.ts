import { enableProdMode, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';

import { environment } from './environments/environment';
import { authInterceptor } from './app/utils/security/auth.interceptor';
import { bootstrapApplication } from '@angular/platform-browser';
import { routes } from './app/app.routes';
import { NgOptimizedImage } from '@angular/common';
import { provideRouter } from '@angular/router'; // Removed withHashLocation if not needed
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ToastrModule } from 'ngx-toastr';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes), // Hash location was false in original config
    importProvidersFrom(
      FormsModule,
      BsDatepickerModule.forRoot(),
      TooltipModule.forRoot(),
      NgOptimizedImage,
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
      }),
      NgMultiSelectDropDownModule.forRoot()
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    providePrimeNG({
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: 'none'
            }
        },
        ripple: true
    })
  ]
})
  .catch(err => console.error(err));
