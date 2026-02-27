import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CompteServer, CompteWeb, IpAddress } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';
import { CompteWebService } from "../../service/compte-web.service";
import { DashboardService } from "../../service/dashboard.service";
import { CompteServerService } from "../../service/compte-server.service";
import { of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
    selector: 'app-add-compte-web-component',
    templateUrl: './add-compte-web-component.component.html',
    styleUrls: ['./add-compte-web-component.component.css'],
    standalone: true,
    imports: [FormsModule, NgFor, BsDatepickerModule]
})
export class AddCompteWebComponentComponent implements OnInit {

  compteWeb: CompteWeb = new CompteWeb();
  serverAccounts: CompteServer[] = [];
  numberBoitier: number = 0;
  idCompte: number = 0;
  date: Date ;
  codesPays: any;
  ipAddresses: IpAddress[] = [];
  regions = ['Tunis', 'Sfax', 'Sousse'];
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  checked: boolean;

  constructor(private router: Router,
              public toastr: ToastrService,
              private compteWebService: CompteWebService,
              private dashboardService: DashboardService,
              private dataService: DataService,
              private compteServerService: CompteServerService) {
    // Initialize toastr if necessary
  }

  ngOnInit() {
    this.dashboardService.isAuthenticated = this.dashboardService.loadTestAuthenticated();

    if (!this.dashboardService.isAuthenticated) {
      this.router.navigate(['/error']);
    } else {
      this.compteServerService.getAllServerAccountForForm().subscribe(res => {
        this.serverAccounts = res.content;
      });

      this.codesPays = this.dataService.codesPays;
      this.dataService.getAllIps().subscribe(res => {
        this.ipAddresses = res;
      });
    }
  }

  // Function to add a new web account and associate it with a server account
  addCompteWeb() {
    this.compteWeb.date_expiration = this.date.getTime();
    for (let i = 0; i == this.serverAccounts.length; i++) {
      if (this.serverAccounts[i].idCompteClientServer == this.idCompte) {
        this.compteWeb.compteClientServer = this.serverAccounts[i];
      }
    }
    this.compteWeb.compteClientServer.idCompteClientServer = this.idCompte;

    this.compteWebService.addCompteWeb(this.compteWeb).subscribe(_compteWeb => {
      this.compteWeb = _compteWeb;
      this.compteWebService.associateCompteWebToCompteServer(this.compteWeb.idCompteClientWeb, this.idCompte).subscribe(res => {
      })
      this.toastr.success('Web Account is added successfully', 'Success!');
      this.compteWeb = new CompteWeb();
      this.router.navigate(['/adminWeb/listWebs']);
      //this.date = "";
    }, error => { this.toastr.error('There is a mistake', 'Error!') });

  }
}
