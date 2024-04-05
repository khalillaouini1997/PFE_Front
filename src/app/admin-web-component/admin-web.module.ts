import { AdminWebComponentRoutingModule } from './admin-web-component-routing.module';
import { AdminWebComponentComponent } from './admin-web-component.component';
import { ComptesWebComponentComponent } from './comptes-web-component/comptes-web-component.component';
import { ComptesServerComponentComponent } from './comptes-server-component/comptes-server-component.component';
import { AddCompteWebComponentComponent } from './add-compte-web-component/add-compte-web-component.component';
import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';
import { DashbordComponent } from './dashbord/dashbord.component';
import { HelpComponent } from './help/help.component';
import { EditComponent } from './help/edit/edit.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AddCompteServerComponent } from './add-compte-server/add-compte-server.component';
import { CompteServerDetailsComponent } from './compte-server-details/compte-server-details.component';
import { IpAdresseComponent } from './ip-adresse/ip-adresse.component';
import { AccessLogComponent } from './access-log/access-log.component';
import { ListTraccarComponent } from './list-traccar/list-traccar.component';
import { CompteAdminComponent } from './compte-admin/compte-admin.component';
import { AddAdminCompteComponent } from './add-admin-compte/add-admin-compte.component';
import { ToastrModule } from 'ngx-toastr';
import { WebSocketService } from '../service/web-socket.service';
import { DataService } from '../service/data.service';
import { RecalculWebComponent } from './recalcul-web/recalcul-web.component';
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {TraccarService} from "../service/traccar.service";
import {DashboardService} from "../service/dashboard.service";
import {CoreService} from "../service/core.service";
import {CompteWebService} from "../service/compte-web.service";
import {CompteServerService} from "../service/compte-server.service";
import { ConfigurationWebComponentComponent } from './configuration-web-component/configuration-web-component.component';


@NgModule({
  imports: [
    CommonModule,
    TooltipModule,
    PaginationModule.forRoot(),
    AdminWebComponentRoutingModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    ToastrModule.forRoot(),
    NgOptimizedImage,

  ],
  declarations: [
    AddCompteWebComponentComponent,
    ComptesServerComponentComponent,
    ComptesWebComponentComponent,
    AdminWebComponentComponent,
    DashbordComponent,
    HelpComponent,
    EditComponent,
    AddCompteServerComponent,
    CompteServerDetailsComponent,
    IpAdresseComponent,
    AccessLogComponent,
    ListTraccarComponent,
    CompteAdminComponent,
    AddAdminCompteComponent,
    RecalculWebComponent,
    ConfigurationWebComponentComponent,


  ], providers: [
    WebSocketService,
    DataService,
    TraccarService,
    DashboardService,
    CoreService,
    CompteWebService,
    CompteServerService
  ]
})
export class AdminWebModule { }
