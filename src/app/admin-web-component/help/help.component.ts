import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { CompteWeb, Intervention } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';
import {CompteServerService} from "../../service/compte-server.service";
import {CompteWebService} from "../../service/compte-web.service";
import {DashboardService} from "../../service/dashboard.service";
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, DatePipe } from '@angular/common';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.css'],
    standalone: true,
    imports: [FormsModule, NgFor, NgIf, DatePipe]
})
export class HelpComponent implements OnInit {
  /**date */
  date: Date = new Date();
  /**submit At date */
  //myDatePickerOptions: IMyOptions = { dateFormat: 'dd-mm-yyyy', };
  @ViewChild('addEditModal')
  addEditModal: ModalDirective;
  modalRef: BsModalRef;
  /**selectedType */
  selectedType: string | null = null;
  /** request type */
  types = [{ name: 'REQUEST', label: 'Demande d\'intervention' },
  { name: 'INPROGRESS', label: 'En cours de traitement' },
  { name: 'CARRYOUT', label: 'Intervention effectuée' },
  { name: 'REJECTED', label: 'Intervention annulée' }
  ]
  comptesWeb: CompteWeb[] = [];
  /**by default selected client is  */
  selectedCompteWebId: number  | null = null;
  /** all intervention */
  interventions: Intervention[] = [];
  /** filtered intervention */
  interventionsFilter: Intervention[] = [];
  /**current intervent */
  currentIntervention = new Intervention();

  loading: boolean = false;


  constructor( private compteServerService: CompteServerService,
               private compteWebService: CompteWebService,
               private dashboardService: DashboardService,
               private dataService: DataService,
               public toastr: ToastrService, vcr: ViewContainerRef) {
    //this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    /**load all client */
    this.loadClient();
  }
  /**load client */
  public loadClient() {
    this.compteWebService.getAllCompteClientWeb().subscribe((res:any) => {
      this.comptesWeb = res;
    })
  }
  /** load intervention */
  public loadIntervention() {
    this.loading = true;
    this.interventionsFilter = [];
    this.interventions = [];
    this.selectedType = null;
    this.dataService.getIntervention(this.selectedCompteWebId as never).subscribe((res: any) => {
        this.interventions = res;
        this.interventionsFilter = res;
      });
  }
  /** on change client load intervention*/
  public onSearchClient() {
    this.loadIntervention();
  }
  /**update intervention */
  public updateIntervention() {
    //  this.currentIntervention.submitAt = new Date(this.date['jsdate']);
    this.dataService.updateIntervention(this.currentIntervention, this.selectedCompteWebId as never).subscribe((res: any) => {
      if (res) {
        this.toastr.success('Success');
      } else {
        this.toastr.error("Echec");
      }
    }, (error: any) => {
      this.toastr.error("Echec");

    })
  }
  onSelectState() {
    this.interventionsFilter = this.interventions.filter(inter => inter.type === this.selectedType);
  }
}
