import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthentificationComponent } from './authentification/authentification.component';

const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'authentification',
        component: AuthentificationComponent
      },
      {
        path: '',
        redirectTo: 'authentification',
        pathMatch: 'full'
      },

      { path: 'adminWeb', loadChildren: () => import('./admin-web-component/admin-web.module').then(m => m.AdminWebModule) },

      /*{
        path: '**',
        component: ErrorComponent
      },
      {
        path: 'error',
        component: ErrorComponent
      }*/
    ], {
      useHash: true
    })
  ],

  exports: [
    RouterModule,
  ]
})
export class AppRoutingModule { }