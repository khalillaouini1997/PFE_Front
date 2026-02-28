import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { CompteWeb, Intervention } from 'src/app/data/data';
import { WebAccountService } from "../../service/web-account.service";
import { InterventionService } from "../../service/intervention.service";
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css'],
  standalone: true,
  imports: [FormsModule, DatePipe]
})
export class HelpComponent implements OnInit {

  date: Date = new Date();
  @ViewChild('addEditModal') addEditModal: ModalDirective;
  modalRef: BsModalRef;
  selectedType: string | null = null;
  types = [
    { name: 'REQUEST', label: 'Demande d\'intervention' },
    { name: 'INPROGRESS', label: 'En cours de traitement' },
    { name: 'CARRYOUT', label: 'Intervention effectuée' },
    { name: 'REJECTED', label: 'Intervention annulée' }
  ];
  comptesWeb: CompteWeb[] = [];
  selectedCompteWebId: number | null = null;
  interventions: Intervention[] = [];
  interventionsFilter: Intervention[] = [];
  currentIntervention = new Intervention();
  loading: boolean = false;

  private readonly webAccountService = inject(WebAccountService);
  private readonly interventionService = inject(InterventionService);
  private readonly toastr = inject(ToastrService);

  ngOnInit() {
    this.loadClient();
  }

  public loadClient() {
    this.webAccountService.getAllCompteClientWeb().subscribe({
      next: (res: any) => {
        this.comptesWeb = res;
      }
    });
  }

  public loadIntervention() {
    if (this.selectedCompteWebId === null) return;

    this.loading = true;
    this.interventionsFilter = [];
    this.interventions = [];
    this.selectedType = null;
    this.interventionService.getIntervention(this.selectedCompteWebId).subscribe({
      next: (res: any) => {
        this.interventions = res;
        this.interventionsFilter = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error("Failed to load interventions");
      }
    });
  }

  public onSearchClient() {
    this.loadIntervention();
  }

  public updateIntervention() {
    if (this.selectedCompteWebId === null) return;

    this.interventionService.updateIntervention(this.currentIntervention, this.selectedCompteWebId).subscribe({
      next: (res: any) => {
        if (res) {
          this.toastr.success('Success');
        } else {
          this.toastr.error("Echec");
        }
      },
      error: () => {
        this.toastr.error("Echec");
      }
    });
  }

  onSelectState() {
    this.interventionsFilter = this.interventions.filter(inter => inter.type === this.selectedType);
  }
}
