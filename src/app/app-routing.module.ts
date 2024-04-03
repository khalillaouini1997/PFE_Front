import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AuthentificationComponent } from './authentification/authentification.component';

export const routes: Routes = [
  {
    path: 'adminWeb',
    loadChildren: () => import('./admin-web-component/admin-web.module')
      .then(m => m.AdminWebModule),
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

