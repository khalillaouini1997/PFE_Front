import { Component, OnInit, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompteWeb, Intervention, createIntervention } from 'src/app/data/data';
import { WebAccountService } from "../../service/web-account.service";
import { InterventionService } from "../../service/intervention.service";
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyTableComponent } from '../../shared/components/empty-table/empty-table.component';

@Component({
    selector: 'app-help',
    standalone: true,
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe, TooltipModule, TranslateModule, PageHeaderComponent, EmptyTableComponent]
})
export class HelpComponent implements OnInit {

  searchForm!: FormGroup;
  updateForm!: FormGroup;

  date: Date = new Date();
  @ViewChild('updateModal') updateModal!: ElementRef<HTMLDialogElement>;
  selectedType = signal<string | null>(null);
  types = [
    { name: 'REQUEST', label: 'Demande d\'intervention' },
    { name: 'INPROGRESS', label: 'En cours de traitement' },
    { name: 'CARRYOUT', label: 'Intervention effectuée' },
    { name: 'REJECTED', label: 'Intervention annulée' }
  ];
  comptesWeb = signal<CompteWeb[]>([]);
  selectedCompteWebId: number | null = null;
  interventions = signal<Intervention[]>([]);
  interventionsFilter = signal<Intervention[]>([]);
  currentIntervention = createIntervention();
  loading = signal<boolean>(false);

  private readonly webAccountService = inject(WebAccountService);
  private readonly interventionService = inject(InterventionService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);

  ngOnInit() {
    this.initForms();
    this.loadClient();
  }

  initForms() {
    this.searchForm = this.fb.group({
      type: [null],
      compteWebId: [null]
    });

    this.updateForm = this.fb.group({
      type: ['', Validators.required],
      response: ['']
    });

    this.searchForm.get('type')?.valueChanges.subscribe(val => {
      this.selectedType.set(val);
      this.onSelectState();
    });
  }

  public loadClient() {
    this.webAccountService.getAllCompteClientWeb().subscribe({
      next: (res: any) => {
        const responseData = res?.data || res;
        this.comptesWeb.set(Array.isArray(responseData) ? responseData : []);
      }
    });
  }

  public loadIntervention() {
    this.selectedCompteWebId = this.searchForm.get('compteWebId')?.value;
    if (this.selectedCompteWebId === null) return;

    this.loading.set(true);
    this.interventionsFilter.set([]);
    this.interventions.set([]);
    this.selectedType.set(null);
    this.searchForm.get('type')?.setValue(null, { emitEvent: false });
    this.interventionService.getIntervention(this.selectedCompteWebId).subscribe({
      next: (res: any) => {
        const responseData = res?.data || res;
        this.interventions.set(Array.isArray(responseData) ? responseData : []);
        this.interventionsFilter.set(Array.isArray(responseData) ? responseData : []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error("Failed to load interventions");
      }
    });
  }

  public onSearchClient() {
    this.loadIntervention();
  }

  public updateIntervention() {
    if (this.selectedCompteWebId === null) return;

    this.currentIntervention.type = this.updateForm.get('type')?.value;
    this.currentIntervention.response = this.updateForm.get('response')?.value;

    this.interventionService.updateIntervention(this.currentIntervention, this.selectedCompteWebId).subscribe({
      next: (res: any) => {
        if (res) {
          this.toastr.success('Success');
          this.closeUpdateModal();
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
    const type = this.selectedType();
    if (type) {
      this.interventionsFilter.set(this.interventions().filter(inter => inter.type === type));
    } else {
      this.interventionsFilter.set(this.interventions());
    }
  }

  openUpdateModal(intervention: Intervention) {
    this.currentIntervention = intervention;
    this.updateForm.patchValue({
      type: intervention.type,
      response: intervention.response
    });
    if (this.updateModal) {
      this.updateModal.nativeElement.showModal();
    }
  }

  closeUpdateModal() {
    if (this.updateModal) {
      this.updateModal.nativeElement.close();
    }
  }
}
