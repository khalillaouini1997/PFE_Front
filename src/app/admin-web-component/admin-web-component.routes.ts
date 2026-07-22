import {Routes} from '@angular/router';
import {AdminWebComponentComponent} from './admin-web-component.component';
import {roleGuard} from '../guards/role.guard';

export const ADMIN_WEB_ROUTES: Routes = [{
  path: '',
  component: AdminWebComponentComponent,
  children: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'dashboard',
      loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      canMatch: [roleGuard(['WEBADMIN', 'GLOBALADMINDESC'])]
    },
    {
      path: 'adminCompte',
      loadComponent: () => import('./compte-admin/compte-admin.component').then(m => m.CompteAdminComponent),
      canMatch: [roleGuard(['GLOBALADMINDESC'])]
    },
    {
      path: 'addAdminCompte',
      loadComponent: () => import('./add-admin-compte/add-admin-compte.component').then(m => m.AddAdminCompteComponent),
      canMatch: [roleGuard(['GLOBALADMINDESC'])]
    },
    {
      path: 'addCompteServer',
      loadComponent: () => import('./add-compte-server/add-compte-server.component').then(m => m.AddCompteServerComponent),
      canMatch: [roleGuard(['WEBADMIN', 'GLOBALADMINDESC'])]
    },
    {
      path: 'configurations/:idCompteClientWeb',
      loadComponent: () => import('./configuration-web-component/configuration-web-component.component').then(m => m.ConfigurationWebComponentComponent),
      canMatch: [roleGuard(['WEBADMIN', 'GLOBALADMINDESC'])]
    },
    {
      path: 'compteDetails/:idCompteClientServer',
      loadComponent: () => import('./compte-server-details/compte-server-details.component').then(m => m.CompteServerDetailsComponent),
      canMatch: [roleGuard(['WEBADMIN', 'GLOBALADMINDESC'])]
    },
    {
      path: 'addAdressIp',
      loadComponent: () => import('./add-adresse-ip/add-adresse-ip.component').then(m => m.AddAdresseIpComponent),
      canMatch: [roleGuard(['GLOBALADMINDESC'])]
    },
    {
      path: 'listAdressIp',
      loadComponent: () => import('./ip-adresse/ip-adresse.component').then(m => m.IpAdresseComponent),
      canMatch: [roleGuard(['GLOBALADMINDESC'])]
    },
    {
      path: 'addCompteWeb',
      loadComponent: () => import('./add-compte-web-component/add-compte-web-component.component').then(m => m.AddCompteWebComponentComponent),
      canMatch: [roleGuard(['WEBADMIN', 'GLOBALADMINDESC'])]
    },
    {
      path: 'listServers',
      loadComponent: () => import('./comptes-server-component/comptes-server-component.component').then(m => m.ComptesServerComponentComponent),
      canMatch: [roleGuard(['WEBADMIN', 'GLOBALADMINDESC'])]
    },
    {
      path: 'listWebs',
      loadComponent: () => import('./comptes-web-component/comptes-web-component.component').then(m => m.ComptesWebComponentComponent),
      canMatch: [roleGuard(['AGENT', 'WEBADMIN', 'GLOBALADMINDESC'])]
    },
    {
      path: 'archiveBoitier/:numBoitier',
      loadComponent: () => import('./archive/archive.component').then(m => m.ArchiveComponent),
      canMatch: [roleGuard(['WEBADMIN', 'GLOBALADMINDESC'])]
    },
    {
      path: 'accessLog',
      loadComponent: () => import('./access-log/access-log.component').then(m => m.AccessLogComponent),
      canMatch: [roleGuard(['AGENT', 'WEBADMIN', 'GLOBALADMINDESC'])]
    },
    {
      path: 'traccar',
      loadComponent: () => import('./list-traccar/list-traccar.component').then(m => m.ListTraccarComponent),
      canMatch: [roleGuard(['WEBADMIN', 'GLOBALADMINDESC'])]
    },
    {
      path: 'billing',
      loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent),
      canMatch: [roleGuard(['GLOBALADMINDESC'])]
    }
  ],
}];
