import { Component, OnInit } from '@angular/core';
import { CompteServer, IpAddress } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';
import {CompteServerService} from "../../service/compte-server.service";
import {BsLocaleService} from "ngx-bootstrap/datepicker";
import { defineLocale } from 'ngx-bootstrap/chronos';
import { frLocale } from 'ngx-bootstrap/locale';
import {of, tap} from "rxjs";
import {catchError} from "rxjs/operators";
defineLocale('fr', frLocale);

@Component({
  selector: 'app-add-compte-server',
  templateUrl: './add-compte-server.component.html',
  styleUrls: ['./add-compte-server.component.css']
})
export class AddCompteServerComponent implements OnInit {

  public notifications = 0;
  compteServer: CompteServer = new CompteServer();
  //compteServerWithBoitier: CompteServerWithBoitier = new CompteServerWithBoitier();
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
  constructor(private compteServerService: CompteServerService,private localeService: BsLocaleService,
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
    // Validate the number of devices (numberBoitier)
    if (this.numberBoitier < 0) {
      // Display an error message if the number of devices is invalid
      console.error('Number of devices not valid');
      return;
    }
    // Validate the pseudo and login
    this.onKeyPseudo(); // Call to validate the pseudo
    this.onKeyLogin();  // Call to validate the login

    // If the pseudo or login are not valid (already exist), you should handle it appropriately.
    // For example, you can display an error message or stop the process.
    if (this.isExistPseudo || this.isExistLogin) {
      console.error('Pseudo or login already exists');
      return;
    }
    // Set up loading and notification states
    this.loading = true;
    // Convert the date expiration to a timestamp
    this.compteServer.date_Expiration = new Date(this.date['jsdate']).getTime();

    // Create the CompteServer using pipe for error handling
    this.compteServerService.createServerComptewithBoitier(this.compteServer, this.numberBoitier)
      .pipe(
        tap(newCompteServer => { // Handle successful creation
          // Reset the form or state as needed
          this.mode = false;
          this.loading = false;
          this.compteServer = new CompteServer();
          this.date = "";
          console.log(`Server Account added with ${newCompteServer.nbrBoitiers} device(s)`);
        }),
        catchError(error => { // Handle errors
          this.mode = true;
          this.loading = false;
          const errorMessage = error?.json()?.message || 'An error occurred';
          console.error(`Cannot add account: ${errorMessage}`);
          return of(null); // Handle error appropriately, emit null or another value
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

