import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthentificationComponent } from './authentification/authentification.component';
import { CompteWebComponent } from './pages/compte-web/compte-web.component';
import { PagesComponent } from './pages/pages.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [];


@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'authentification',
        component: AuthentificationComponent
      },
      {
        path: 'adminWeb',
        component: PagesComponent,
        children: [

          {
            path: 'dashboard',
            component: DashboardComponent
          },

          {
            path: 'compteweb',
            component: CompteWebComponent
          },
        ]
      },
      {
        path: '',
        redirectTo: 'authentification',
        pathMatch: 'full'
      },
    ], {
      useHash: true
    }),
  ],

  exports: [
    RouterModule,
  ]
})
export class AppRoutingModule { }
