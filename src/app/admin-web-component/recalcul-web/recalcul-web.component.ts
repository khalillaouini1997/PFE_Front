import { Component, OnInit, inject } from '@angular/core';
import { CompteWeb, RecalculatePayload } from "../../data/data";
import { WebSocketService } from "../../service/web-socket.service";
import { ActivatedRoute, Router } from "@angular/router";
import { BoitierService } from "../../service/boitier.service";
import { WebAccountService } from "../../service/web-account.service";
import { ToastrService } from "ngx-toastr";
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgFor, LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-recalcul-web',
  templateUrl: './recalcul-web.component.html',
  styleUrls: ['./recalcul-web.component.css'],
  standalone: true,
  imports: [FormsModule, BsDatepickerModule, TooltipModule, LowerCasePipe]
})
export class RecalculWebComponent implements OnInit {

  notifications: string[] = [];
  recalculeP: RecalculatePayload = new RecalculatePayload();
  idCompteClientWeb: number = 0;
  numBoitier: number = 0;
  compteWeb: CompteWeb = new CompteWeb();
  datestart: any = { jsdate: new Date() };
  typeRecalcule: string = "";

  private readonly route = inject(ActivatedRoute);
  private readonly webAccountService = inject(WebAccountService);
  private readonly boitierService = inject(BoitierService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly toastr = inject(ToastrService);

  constructor() {
    // Open connection with server socket
    const stompClient = this.webSocketService.connect();
    stompClient.connect({}, frame => {
      stompClient.subscribe('/topic/notification', notifications => {
        this.notifications.push(JSON.parse(notifications.body).info);
      });
    });
  }

  ngOnInit(): void {
    this.idCompteClientWeb = parseInt(this.route.snapshot.params['idCompteClientWeb']);
    this.recalculeP.idBoitier = parseInt(this.route.snapshot.params['numBoitier']);
    this.webAccountService.getWebAccountById(this.idCompteClientWeb).subscribe(_compteWeb => {
      this.compteWeb = _compteWeb;
    });
  }

  recalcule() {
    if (this.typeRecalcule == "recalcule historique") {
      this.recalculePath();
    } else if (this.typeRecalcule == "recalcule carburant") {
      this.recalculeFuel();
    } else if (this.typeRecalcule == "recalcule boitier") {
      this.recalculeBoitier();
    }
  }

  recalculePath() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      this.recalculeP.recalculeStartDate = new Date(this.datestart.jsdate).getTime();
      this.boitierService.recalculePaths(this.idCompteClientWeb, this.recalculeP).subscribe();
    }
  }

  recalculeBoitier() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      this.recalculeP.recalculeStartDate = new Date(this.datestart.jsdate).getTime();
      this.boitierService.recalculeBoitier(this.idCompteClientWeb, this.recalculeP).subscribe();
    }
  }

  recalculeFuel() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      this.recalculeP.recalculeStartDate = new Date(this.datestart.jsdate).getTime();
      this.boitierService.recalculeFuel(this.idCompteClientWeb, this.recalculeP).subscribe();
    }
  }
}
