import { Component, OnInit } from '@angular/core';
import {CompteServer, CompteServerWithBoitier, IpAddress} from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';
import {CompteServerService} from "../../service/compte-server.service";
import {BsLocaleService} from "ngx-bootstrap/datepicker";
import { defineLocale } from 'ngx-bootstrap/chronos';
import { frLocale } from 'ngx-bootstrap/locale';

import { ToastrService } from 'ngx-toastr';
import {of, tap} from "rxjs";
import {catchError} from "rxjs/operators";
import {Router} from "@angular/router";


defineLocale('fr', frLocale);

@Component({
  selector: 'app-add-compte-server',
  templateUrl: './add-compte-server.component.html',
  styleUrls: ['./add-compte-server.component.css']
})
export class AddCompteServerComponent implements OnInit {

  public notifications = 0;
  compteServer: CompteServer = new CompteServer();
  compteServerWithBoitier: CompteServerWithBoitier = new CompteServerWithBoitier();
  numberBoitier: number = 0;
  ipAddresses: IpAddress[];
  public loading = false;
  /*public myDatePickerOptions: IMyOptions = {
    dateFormat: 'dd-mm-yyyy',
  };*/

  mode: boolean = false;
  messageError: string;
  isExistPseudo: boolean;
  isExistLogin: boolean;
  confirmationPassword: String;
  public date: Object;

  constructor(private dataService: DataService, public toastr: ToastrService, private router: Router,
              private compteServerService: CompteServerService, private localeService: BsLocaleService,
  ) {

    // Open connection with server socket
    /*let stompClient = this.webSocketService.connect();
    stompClient.connect({}, frame => {

      // Subscribe to notification topic
      stompClient.subscribe('/topic/notification', notifications => {
        this.notifications = JSON.parse(notifications.body).count;
      })
    });*/
    this.localeService.use('fr');
  }



  ngOnInit() {
    /* if (this.service.isAuthenticated == false) {
       this.router.navigate(['/error']);
     } else {
       this.ipAddresses = this.service.ips;
     }**/
  }


  //=====================================
  //           add Server Account
  //=====================================


  addCompteServer() {
    if (this.numberBoitier < 0) {
      this.toastr.error('number of Devices not valid', 'Error!');
      return;
    }

    this.notifications = 0;
    this.loading = true;
    this.compteServer.date_Expiration = new Date(this.date['jsdate']).getTime();
    this.onKeyLogin();
    this.onKeyPseudo();

    this.dataService.createServerComptewithBoitier(this.compteServer, this.numberBoitier)
      .pipe(
        tap(_compteServer => {
          // Success handling
          this.mode = false;
          this.loading = false;
          this.compteServerWithBoitier = _compteServer;
          this.confirmationPassword = "";
          this.compteServer = new CompteServer();
          this.date = "";

          this.toastr.success('Server Account added with ' + this.compteServerWithBoitier.nbrBoitiers + ' device(s)', 'Success!');

          this.router.navigate(['/adminWeb/listWebs']);
        }),
        catchError(error => {
          // Error handling
          this.mode = true;
          const jsonError = error.json();
          this.messageError = jsonError.message;
          this.loading = false;
          this.toastr.error('can not add account', 'Error!');
          return of(null); // Return an empty observable to prevent chain propagation
        })
      )
      .subscribe(); // Subscribe without arguments to trigger execution
  }


  onKeyPseudo() {
    this.compteServerService.isExistPseudo(this.compteServer.pseudo).subscribe(res => {
      this.isExistPseudo = res;
    })

  }
  onKeyLogin() {
    this.compteServerService.isExistPseudo(this.compteServer.login).subscribe(res => {
      this.isExistLogin = res;
    })
  }

  reinitialisation() {
    this.numberBoitier = 0;
  }


}



