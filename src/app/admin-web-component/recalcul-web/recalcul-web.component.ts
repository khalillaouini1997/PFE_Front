import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, LowerCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from "@angular/router";
import { RecalculatePayload } from "../../data/data";
import { WebAccountService } from '../../service/web-account.service';
import { BoitierService } from '../../service/boitier.service';
import { WebSocketService } from '../../service/web-socket.service';
import { ToastrService } from 'ngx-toastr';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

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
  @ViewChild('notificationModal') notificationModal!: ElementRef<HTMLDialogElement>;

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
      this.recalculeP.recalculeStartDate = datestart ? new Date(datestart).getTime() : Date.now();
      this.boitierService.recalculePaths(this.idCompteClientWeb, this.recalculeP).subscribe();
      if (this.notificationModal) {
        this.notificationModal.nativeElement.showModal();
      }
    }
  }

  recalculeBoitier() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      const datestart = this.recalculForm.get('datestart')?.value;
      this.recalculeP.recalculeStartDate = datestart ? new Date(datestart).getTime() : Date.now();
      this.boitierService.recalculeBoitier(this.idCompteClientWeb, this.recalculeP).subscribe();
      if (this.notificationModal) {
        this.notificationModal.nativeElement.showModal();
      }
    }
  }

  recalculeFuel() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      const datestart = this.recalculForm.get('datestart')?.value;
      this.recalculeP.recalculeStartDate = datestart ? new Date(datestart).getTime() : Date.now();
      this.boitierService.recalculeFuel(this.idCompteClientWeb, this.recalculeP).subscribe();
      if (this.notificationModal) {
        this.notificationModal.nativeElement.showModal();
      }
    }
  }

  reinitialisation() {
    this.notifications = [];
    if (this.notificationModal) {
      this.notificationModal.nativeElement.close();
    }
  }
}
