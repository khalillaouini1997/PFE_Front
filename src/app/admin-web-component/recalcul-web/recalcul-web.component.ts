import {Component, ElementRef, OnInit, ViewContainerRef} from '@angular/core';
import {CompteWeb, RecalculatePayload} from "../../data/data";
import {WebSocketService} from "../../service/web-socket.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DataService} from "../../service/data.service";
import {CompteWebService} from "../../service/compte-web.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-recalcul-web',
  templateUrl: './recalcul-web.component.html',
  styleUrls: ['./recalcul-web.component.css']
})
export class RecalculWebComponent implements OnInit {

  notifications: string[] = [];
  recalculeP: RecalculatePayload = new RecalculatePayload();
  idCompteClientWeb: number;
  numBoitier: number;
  compteWeb: CompteWeb = new CompteWeb();
  datestart: Date = new Date();
  typeRecalcule: String;
  reinitialisation: any;
  tooltipup: any;
  constructor(myElement: ElementRef, private route: ActivatedRoute,
              private compteWebService: CompteWebService, private dataService: DataService, private router: Router, private toastr: ToastrService, vcr: ViewContainerRef, private webSocketService: WebSocketService) {


        // Open connection with server socket
        let stompClient = this.webSocketService.connect();
        stompClient.connect({}, frame => {

        // Subscribe to notification topic
        stompClient.subscribe('/topic/notification', notifications => {
        // Update notifications attribute with the recent messsage sent from the server
        this.notifications.push(JSON.parse(notifications.body).info);
      })
      });

      }

  ngOnInit(): void {

    this.idCompteClientWeb = parseInt(this.route.snapshot.params['idCompteClientWeb']);
    this.recalculeP.idBoitier = parseInt(this.route.snapshot.params['numBoitier']);
    this.compteWebService.getWebAccountById(this.idCompteClientWeb).subscribe(_compteWeb => {

      //web account
      this.compteWeb = _compteWeb;
    })

  }

  recalcule() {
    if (this.typeRecalcule == "recalcule historique") {
      this.recalculePath();
    }

    if (this.typeRecalcule == "recalcule carburant") {
      this.recalculeFuel();
    }

    if (this.typeRecalcule == "recalcule boitier") {
      this.recalculeBoitier();
    }

    if (this.typeRecalcule == "recalcule alert") {

    }
  }


  recalculePath() {
    this.notifications.splice(0, this.notifications.length);
    let res = confirm("Vous êtes sur de vouloir faire le recalcule ?");
    if (res) {


      this.recalculeP.recalculeStartDate = new Date(this.datestart['jsdate']).getTime();

      this.dataService.recalculePaths(this.idCompteClientWeb, this.recalculeP).subscribe(res => { })
    }
  }
  recalculeBoitier() {
    this.notifications.splice(0, this.notifications.length);
    let res = confirm("Vous êtes sur de vouloir faire le recalcule ?");
    if (res) {


      this.recalculeP.recalculeStartDate = new Date(this.datestart['jsdate']).getTime();

      this.dataService.recalculeBoitier(this.idCompteClientWeb, this.recalculeP).subscribe(res => { })
    }
  }
  recalculeFuel() {
    this.notifications.splice(0, this.notifications.length);

    let res = confirm("Vous êtes sur de vouloir faire le recalcule ?");
    if (res) {


      this.recalculeP.recalculeStartDate = new Date(this.datestart['jsdate']).getTime();

      this.dataService.recalculeFuel(this.idCompteClientWeb, this.recalculeP).subscribe(res => { })
    }
  }

}
