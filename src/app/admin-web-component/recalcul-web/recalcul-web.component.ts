import { Component, OnInit, inject } from '@angular/core';
import { CompteWeb, RecalculatePayload } from "../../data/data";
import { ActivatedRoute, Router } from "@angular/router";
import { BoitierService } from "../../service/boitier.service";
import { WebAccountService } from "../../service/web-account.service";
import { ToastrService } from "ngx-toastr";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { LowerCasePipe } from '@angular/common';
import { WebSocketService } from 'src/app/service/web-socket.service';

import { RouterModule } from "@angular/router";

@Component({
    selector: 'app-recalcul-web',
    standalone: true,
    templateUrl: './recalcul-web.component.html',
    styleUrls: ['./recalcul-web.component.css'],
    imports: [FormsModule, ReactiveFormsModule, BsDatepickerModule, TooltipModule, LowerCasePipe, RouterModule]
})
export class RecalculWebComponent implements OnInit {

  notifications: string[] = [];
  recalculeP: RecalculatePayload = new RecalculatePayload();
  idCompteClientWeb: number = 0;
  numBoitier: number = 0;
  compteWeb: any = {};
  recalculForm!: FormGroup;

  tooltipup = 'recalcule';

  private readonly route = inject(ActivatedRoute);
  private readonly webAccountService = inject(WebAccountService);
  private readonly boitierService = inject(BoitierService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.webSocketService.getNotifications().subscribe((notification: any) => {
      if (notification) {
        this.toastr.success(notification.message, "Notification " + notification.type);
      }
    });
  }

  ngOnInit(): void {
    this.initForms();
    this.idCompteClientWeb = parseInt(this.route.snapshot.params['idCompteClientWeb']);
    this.recalculeP.idBoitier = parseInt(this.route.snapshot.params['numBoitier']);
    this.webAccountService.getWebAccountById(this.idCompteClientWeb).subscribe(_compteWeb => {
      this.compteWeb = _compteWeb;
    });
  }

  initForms() {
    this.recalculForm = this.fb.group({
      datestart: [new Date(), Validators.required],
      typeRecalcule: ['', Validators.required]
    });
  }

  recalcule() {
    const typeRecalcule = this.recalculForm.get('typeRecalcule')?.value;
    if (typeRecalcule == "recalcule historique") {
      this.recalculePath();
    } else if (typeRecalcule == "recalcule carburant") {
      this.recalculeFuel();
    } else if (typeRecalcule == "recalcule boitier") {
      this.recalculeBoitier();
    }
  }

  recalculePath() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      const datestart = this.recalculForm.get('datestart')?.value;
      this.recalculeP.recalculeStartDate = datestart ? new Date(datestart).getTime() : new Date().getTime();
      this.boitierService.recalculePaths(this.idCompteClientWeb, this.recalculeP).subscribe();
    }
  }

  recalculeBoitier() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      const datestart = this.recalculForm.get('datestart')?.value;
      this.recalculeP.recalculeStartDate = datestart ? new Date(datestart).getTime() : new Date().getTime();
      this.boitierService.recalculeBoitier(this.idCompteClientWeb, this.recalculeP).subscribe();
    }
  }

  recalculeFuel() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      const datestart = this.recalculForm.get('datestart')?.value;
      this.recalculeP.recalculeStartDate = datestart ? new Date(datestart).getTime() : new Date().getTime();
      this.boitierService.recalculeFuel(this.idCompteClientWeb, this.recalculeP).subscribe();
    }
  }

  reinitialisation() {
    this.notifications = [];
  }
}
