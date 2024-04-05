import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CompteServer, CompteWeb } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';
import {CompteWebService} from "../../service/compte-web.service";
import {DashboardService} from "../../service/dashboard.service";

/**
 *
 * created by AHMED HAYEL
 *
 */

@Component({
  selector: 'app-add-compte-web-component',
  templateUrl: './add-compte-web-component.component.html',
  styleUrls: ['./add-compte-web-component.component.css']
})
export class AddCompteWebComponentComponent implements OnInit {

  compteWeb: CompteWeb = new CompteWeb();
  serverAccounts: CompteServer[];
  idCompte: number = 0;
  //myDatePickerOptions: IMyOptions = { dateFormat: 'dd-mm-yyyy', };
  date: Object;
  codesPays: any;
  ipAddresses = [];

  //select periode
  region = 'Tunis';
  regions = ['Tunis', 'Sfax', 'Sousse'];

  //select periode
  notifSub = 'date_sub(NOW(), INTERVAL 1 DAY)';
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  checked: boolean;
  constructor(private router: Router, private compteWebService: CompteWebService, private dashboardService: DashboardService, private dataService: DataService) {
    //this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.dashboardService.isAuthenticated = this.dashboardService.loadTestAuthenticated();

    if (!this.dashboardService.isAuthenticated) {
      this.router.navigate(['/error']);
    } else {
      this.dataService.getAllServerAccountForForm().subscribe(res => {

        this.serverAccounts = res.content;
      });

      this.codesPays = this.dataService.codesPays;
      this.dataService.getAllIps().subscribe(res => {
        this.ipAddresses = res;
      });
    }
  }

  //==================================
  // add compte web with serve accout
  //==================================

  addCompteWeb() {
    this.compteWeb.date_expiration = new Date(this.date['jsdate']).getTime();
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
      //this.toastr.success('Web Account is added successfully', 'Success!');
      this.compteWeb = new CompteWeb();
      this.date = "";
    }, error => { /*this.toastr.error('There is a mistake', 'Error!')*/ });

  }


}
