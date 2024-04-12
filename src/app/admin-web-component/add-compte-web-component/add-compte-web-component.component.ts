import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {CompteServer, CompteWeb, IpAddress} from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';
import {CompteWebService} from "../../service/compte-web.service";
import {DashboardService} from "../../service/dashboard.service";
import {CompteServerService} from "../../service/compte-server.service";

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
  numberBoitier: number = 0;
  idCompte: number = 0;
  //myDatePickerOptions: IMyOptions = { dateFormat: 'dd-mm-yyyy', };
  date: Object;
  codesPays: any;
  ipAddresses: IpAddress[] = [];
  //select periode
  regions = ['Tunis', 'Sfax', 'Sousse'];
  //select periode
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  checked: boolean;
  constructor(private router: Router,
              private compteWebService: CompteWebService,
              private dashboardService: DashboardService,
              private dataService: DataService,
              private compteServerService: CompteServerService,) {
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
    // Convert the date expiration to a timestamp
    this.compteWeb.date_expiration = new Date(this.date['jsdate']).getTime();

    // Create a CompteServer with the necessary data from CompteWeb
    const compteServerData = new CompteServer();
    compteServerData.login = this.compteWeb.login;
    compteServerData.pseudo = this.compteWeb.login;
    compteServerData.password = this.compteWeb.password;
    compteServerData.ipAdresse = this.compteWeb.ipAdresse;
    compteServerData.date_Expiration = this.compteWeb.date_expiration;
    compteServerData.nbrBoitiers = this.numberBoitier;

    // Call the service to create the CompteServer with the specified number of devices
    this.compteServerService.createServerComptewithBoitier(compteServerData, this.numberBoitier).subscribe(
      (newCompteServer) => {
        // Successfully created CompteServer, associate it with CompteWeb
        this.compteWeb.compteClientServer = newCompteServer;
        // Now add the CompteWeb with the newly associated CompteServer
        this.compteWebService.addCompteWeb(this.compteWeb).subscribe(
          (newCompteWeb) => {
            // Successfully added CompteWeb
            console.log('Web Account and associated Server Account added successfully');
            // Reset the CompteWeb instance and other state variables as needed
            this.compteWeb = new CompteWeb();
            this.date = '';
          },
          (error) => {
            // Handle errors gracefully
            console.error('Error adding CompteWeb:', error);
          }
        );
      },
      (error) => {
        // Handle errors gracefully
        console.error('Error creating CompteServer:', error);
      }
    );
  }




}
