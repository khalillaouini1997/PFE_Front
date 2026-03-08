import { enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';

import { environment } from './environments/environment';
import { authInterceptor } from './app/utils/security/auth.interceptor';
import { bootstrapApplication } from '@angular/platform-browser';
import { routes } from './app/app-routing.module';
import { NgOptimizedImage } from '@angular/common';
import { provideRouter } from '@angular/router'; // Removed withHashLocation if not needed
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes), // Hash location was false in original config
    importProvidersFrom(
      FormsModule,
      PaginationModule,
      BsDatepickerModule.forRoot(),
      TooltipModule.forRoot(),
      NgOptimizedImage,
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations()
  ]
})
  .catch(err => console.error(err));
