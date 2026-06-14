import { Routes } from '@angular/router';
import { AdminWebComponentComponent } from './admin-web-component.component';

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
      loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
      path: 'adminCompte',
      loadComponent: () => import('./compte-admin/compte-admin.component').then(m => m.CompteAdminComponent)
    },
    {
      path: 'addAdminCompte',
      loadComponent: () => import('./add-admin-compte/add-admin-compte.component').then(m => m.AddAdminCompteComponent)
    },
    {
      path: 'addCompteServer',
      loadComponent: () => import('./add-compte-server/add-compte-server.component').then(m => m.AddCompteServerComponent)
    },
    {
      path: 'configurations/:idCompteClientWeb',
      loadComponent: () => import('./configuration-web-component/configuration-web-component.component').then(m => m.ConfigurationWebComponentComponent)
    },
    {
      path: 'compteDetails/:idCompteClientServer',
      loadComponent: () => import('./compte-server-details/compte-server-details.component').then(m => m.CompteServerDetailsComponent)
    },
    {
      path: 'addAdressIp',
      loadComponent: () => import('./add-adresse-ip/add-adresse-ip.component').then(m => m.AddAdresseIpComponent)
    },
    {
      path: 'listAdressIp',
      loadComponent: () => import('./ip-adresse/ip-adresse.component').then(m => m.IpAdresseComponent)
    },
    {
      path: 'addCompteWeb',
      loadComponent: () => import('./add-compte-web-component/add-compte-web-component.component').then(m => m.AddCompteWebComponentComponent)
    },
    {
      path: 'listServers',
      loadComponent: () => import('./comptes-server-component/comptes-server-component.component').then(m => m.ComptesServerComponentComponent)
    },
    {
      path: 'listWebs',
      loadComponent: () => import('./comptes-web-component/comptes-web-component.component').then(m => m.ComptesWebComponentComponent)
    },
    {
      path: 'archiveBoitier/:numBoitier',
      loadComponent: () => import('./archive/archive.component').then(m => m.ArchiveComponent)
    },
    {
      path: 'intervention',
      loadComponent: () => import('./help/help.component').then(m => m.HelpComponent)
    },
    {
      path: 'technicianIntervention',
      loadComponent: () => import('./vehicule-info/vehicule-info.component').then(m => m.VehiculeInfoComponent)
    },
    {
      path: 'accessLog',
      loadComponent: () => import('./access-log/access-log.component').then(m => m.AccessLogComponent)
    },
    {
      path: 'traccar',
      loadComponent: () => import('./list-traccar/list-traccar.component').then(m => m.ListTraccarComponent)
    },
    {
      path: 'billing',
      loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent)
    }
  ],
}];
