import { provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

export default [
  provideZoneChangeDetection(),
  provideAnimations(),
  importProvidersFrom(ToastrModule.forRoot())
];
