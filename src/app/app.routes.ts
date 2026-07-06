import { Routes } from '@angular/router';
import { AuthentificationComponent } from './authentification/authentification.component';
import { ErrorComponent } from './error/error.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'adminWeb',
    canMatch: [authGuard],
    loadChildren: () => import('./admin-web-component/admin-web-component.routes')
      .then(m => m.ADMIN_WEB_ROUTES),
  },
  {
    path: 'authentification',
    component: AuthentificationComponent
  },
  {
    path: 'error',
    component: ErrorComponent
  },
  {
    path: '',
    redirectTo: 'authentification',
    pathMatch: 'full'
  }
];
