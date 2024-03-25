import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthentificationComponent } from './authentification/authentification.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CompteWebComponent } from './pages/compte-web/compte-web.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PagesComponent } from './pages/pages.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import {PaginationModule} from "ngx-bootstrap/pagination";
import { ComptewebconfigComponent } from './pages/compte-web/comptewebconfig/comptewebconfig.component';
import {BsDatepickerModule} from "ngx-bootstrap/datepicker";

@NgModule({
  declarations: [
    AppComponent,
    AuthentificationComponent,
    CompteWebComponent,
    DashboardComponent,
    PagesComponent,
    ComptewebconfigComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(),
    PaginationModule,
    BsDatepickerModule,
    // ToastrModule added
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
