import { ComptesWebComponentComponent } from './comptes-web-component/comptes-web-component.component';
import { ComptesServerComponentComponent } from './comptes-server-component/comptes-server-component.component';
import { AddCompteWebComponentComponent } from './add-compte-web-component/add-compte-web-component.component';
import { DashbordComponent } from './dashbord/dashbord.component';
import { AdminWebComponentComponent } from './admin-web-component.component';
import { Routes } from '@angular/router';
import { HelpComponent } from './help/help.component';
import { AddCompteServerComponent } from './add-compte-server/add-compte-server.component';
import { CompteServerDetailsComponent } from './compte-server-details/compte-server-details.component';
import { IpAdresseComponent } from './ip-adresse/ip-adresse.component';
import { AccessLogComponent } from './access-log/access-log.component';
import { ListTraccarComponent } from './list-traccar/list-traccar.component';
import { CompteAdminComponent } from './compte-admin/compte-admin.component';
import { AddAdminCompteComponent } from './add-admin-compte/add-admin-compte.component';
import { ConfigurationWebComponentComponent } from "./configuration-web-component/configuration-web-component.component";
import { RecalculWebComponent } from "./recalcul-web/recalcul-web.component";
import { ArchiveComponent } from "./archive/archive.component";
import { VehiculeInfoComponent } from "./vehicule-info/vehicule-info.component";
import { AddAdresseIpComponent } from "./add-adresse-ip/add-adresse-ip.component";


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
      component: DashbordComponent
    },
    {
      path: 'adminCompte',
      component: CompteAdminComponent
    },
    {
      path: 'addAdminCompte',
      component: AddAdminCompteComponent
    },
    {
      path: 'addCompteServer',
      component: AddCompteServerComponent
    },
    {
      path: 'configurations/:idCompteClientWeb',
      component: ConfigurationWebComponentComponent
    },
    {
      path: 'compteDetails/:idCompteClientServer',
      component: CompteServerDetailsComponent
    },
    {
      path: 'addAdressIp',
      component: AddAdresseIpComponent
    },
    {
      path: 'listAdressIp',
      component: IpAdresseComponent
    },
    {
      path: 'addCompteWeb',
      component: AddCompteWebComponentComponent
    },
    {
      path: 'listServers',
      component: ComptesServerComponentComponent
    },
    {
      path: 'listWebs',
      component: ComptesWebComponentComponent
    },
    {
      path: 'archiveBoitier/:numBoitier',
      component: ArchiveComponent
    },
    {
      path: 'recalcule/:idCompteClientWeb/:numBoitier',
      component: RecalculWebComponent
    },
    {
      path: 'intervention',
      component: HelpComponent
    },
    {
      path: 'technicianIntervention',
      component: VehiculeInfoComponent
    },
    {
      path: 'accessLog',
      component: AccessLogComponent
    },
    {
      path: 'traccar',
      component: ListTraccarComponent
    }


  ],
}];

