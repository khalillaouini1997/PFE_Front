import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';

import { ActivatedRoute, RouterModule } from "@angular/router";

import { RecalculatePayload } from "../../data/data";
import { WebAccountService } from '../../service/web-account.service';
import { BoitierService } from '../../service/boitier.service';
import { WebSocketService } from '../../service/web-socket.service';
import { ToastrService } from 'ngx-toastr';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-recalcul-web',
  standalone: true,
  templateUrl: './recalcul-web.component.html',
  styleUrls: ['./recalcul-web.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    RouterModule,
    DatePickerModule
  ]
})
export class RecalculWebComponent implements OnInit {

  notifications:string[]=[];

  recalculeP:RecalculatePayload=new RecalculatePayload();

  idCompteClientWeb:number=0;

  compteWeb:any={};

  recalculForm!:FormGroup;

  @ViewChild('notificationModal')
  notificationModal!:ElementRef<HTMLDialogElement>;

  private readonly route=inject(ActivatedRoute);

  private readonly webAccountService=
    inject(WebAccountService);

  private readonly boitierService=
    inject(BoitierService);

  private readonly webSocketService=
    inject(WebSocketService);

  private readonly toastr=
    inject(ToastrService);

  private readonly fb=
    inject(FormBuilder);

  constructor(){

    this.webSocketService
      .getNotifications()
      .subscribe((notification:any)=>{

        if(notification){

          this.notifications.push(
            notification.message
          );

          this.toastr.success(
            notification.message,
            "Notification"
          );

        }

      });

  }


  ngOnInit():void{

    this.initForms();

    this.idCompteClientWeb=
      Number.parseInt(
        this.route.snapshot.params['idCompteClientWeb']
      );

    this.recalculeP.idBoitier=
      Number.parseInt(
        this.route.snapshot.params['numBoitier']
      );

    this.webAccountService
      .getWebAccountById(
        this.idCompteClientWeb
      )
      .subscribe(data=>{

        this.compteWeb=data;

      });

  }


  initForms(){

    this.recalculForm=this.fb.group({

      datestart:[
        new Date(),
        Validators.required
      ],

      typeRecalcule:[
        '',
        Validators.required
      ]

    });

  }


  recalcule(){

    const type=
      this.recalculForm.get(
        'typeRecalcule'
      )?.value;


    switch(type){

      case 'recalcule historique':
        this.recalculePath();
        break;

      case 'recalcule carburant':
        this.recalculeFuel();
        break;

      case 'recalcule boitier':
        this.recalculeBoitier();
        break;

    }

  }


  recalculePath(){

    this.executeRecalculation(
      ()=>this.boitierService.recalculePaths(
        this.idCompteClientWeb,
        this.recalculeP
      )
    );

  }


  recalculeFuel(){

    this.executeRecalculation(
      ()=>this.boitierService.recalculeFuel(
        this.idCompteClientWeb,
        this.recalculeP
      )
    );

  }


  recalculeBoitier(){

    this.executeRecalculation(
      ()=>this.boitierService.recalculeBoitier(
        this.idCompteClientWeb,
        this.recalculeP
      )
    );

  }


  executeRecalculation(service:any){

    this.notifications=[];

    const date=
      this.recalculForm.get(
        'datestart'
      )?.value;


    this.recalculeP.recalculeStartDate=
      date.getTime();

    service().subscribe();

    this.notificationModal
      ?.nativeElement
      .showModal();

  }


  reinitialisation(){

    this.notifications=[];

    this.notificationModal
      ?.nativeElement
      .close();

  }

}
