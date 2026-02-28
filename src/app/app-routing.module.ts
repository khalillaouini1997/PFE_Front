import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AuthentificationComponent } from './authentification/authentification.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'adminWeb',
    canMatch: [authGuard],
    loadChildren: () => import('./admin-web-component/admin-web-component-routing.module')
      .then(m => m.ADMIN_WEB_ROUTES),
  },
  {
    path: 'authentification',
    component: AuthentificationComponent
  },
  {
    path: '',
    redirectTo: 'authentification',
    pathMatch: 'full'
  }
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}

