import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { Boitier, CompteServer, createCompteServer, createBoitier } from 'src/app/data/data';
import { CompteServerService } from "../../service/compte-server.service";
import { BoitierService } from "../../service/boitier.service";

import { ToastrService } from "ngx-toastr";
import { withToast } from '../../utils/toast.helpers';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyTableComponent } from '../../shared/components/empty-table/empty-table.component';

@Component({
    selector: 'app-compte-server-details',
    standalone: true,
    templateUrl: './compte-server-details.component.html',
    styleUrls: ['./compte-server-details.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, PaginatorModule, DatePipe, DecimalPipe, NgClass, RouterModule, TranslateModule, PageHeaderComponent, EmptyTableComponent]
})
export class CompteServerDetailsComponent implements OnInit, OnDestroy {
  addForm!: FormGroup;
  searchForm!: FormGroup;
  paginationForm!: FormGroup;
  updateForm!: FormGroup;
  @ViewChild('updateBoitierModal') updateBoitierModal!: ElementRef<HTMLDialogElement>;

  private refreshInterval: any;
  compteServer: CompteServer = createCompteServer();
  boitiers: Boitier[] = [];
  boitiersInvalid: Boitier[] = [];
  BOITIER_INSTALLED: number = 0;
  BOITIER_NOT_INSTALLED: number = 0;
  selectedBoitier: Boitier = createBoitier();
  ID_COMPTE: number = 0;
  nbrBoitiers: number = 0;
  searchBoitier: string = "";
  intervalFrom: number = 0;
  intervalTo: number = 0;
  mode: boolean = false;
  messageError: string = "";
  today: Date = new Date();

  public maxSize: number = 5;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  itemsPerPage = 15;
  private loadingInProgress: boolean = false;

  private readonly route = inject(ActivatedRoute);
  private readonly compteServerService = inject(CompteServerService);
  private readonly boitierService = inject(BoitierService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);

  ngOnInit() {
    this.initForms();


    this.route.params.subscribe((params: Params) => {
      this.ID_COMPTE = +params['idCompteClientServer'];
      this.loadCompteDetails();
      this.loadingInProgress = false; // Reset guard for route change
      this.loadBoitierList();
    });

    this.refreshInterval = setInterval(() => {
      this.refreshBoitierArchives();
    }, 20000);
  }

  initForms() {
    this.addForm = this.fb.group({
      nbrBoitiers: [0, [Validators.required, Validators.min(1)]]
    });
    this.searchForm = this.fb.group({
      searchBoitier: ['']
    });
    this.paginationForm = this.fb.group({
      bigCurrentPage: [1]
    });
    this.updateForm = this.fb.group({
      label: ['', Validators.required]
    });

    this.paginationForm.get('bigCurrentPage')?.valueChanges.subscribe(val => {
      this.bigCurrentPage = val;
    });
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private loadCompteDetails() {
    this.compteServerService.getCompteServerById(this.ID_COMPTE).subscribe(res => {
      // Handle nested response structure
      const data = res.data || res;
      this.compteServer = data;
      this.intervalFrom = data.intervaleStart;
      this.intervalTo = data.intervaleEnd;
      this.BOITIER_NOT_INSTALLED = data.availableSlotsCount;
      if (data.installedBoitiersCount !== undefined) {
        this.BOITIER_INSTALLED = data.installedBoitiersCount;
      }
      this.cdr.detectChanges();
    });
  }

  loadBoitierList(event?: any) {
    if (this.loadingInProgress) return;
    this.loadingInProgress = true;
    this.cdr.detectChanges();

    // Extract pagination parameters from the PrimeNG table event
    let page = 0;
    let size = this.itemsPerPage;

    if (event) {
      page = event.first ? Math.floor(event.first / event.rows) : 0;
      size = event.rows || this.itemsPerPage;
    } else {
      // When called without event (e.g., from ngOnInit), use current page from form
      page = this.bigCurrentPage - 1; // Convert to 0-based
    }

    const keyword = (this.searchForm.get('searchBoitier')?.value || "").trim();
    this.boitierService.getBoitierOfAccount(this.ID_COMPTE, keyword, page, size).subscribe({
      next: (res: any) => {
        // Handle different response structures
        let content = res.content;
        let pageData = res.page;
        
        // Handle nested data structure: { success: true, data: { content: [...], page: {...} } }
        if (!content && res.data) {
          content = res.data.content || res.data;
          pageData = res.data.page || res.data;
        }
        // Handle direct array response
        if (!content && Array.isArray(res)) {
          content = res;
        }
        // Default to empty array
        if (!content) {
          content = [];
        }
        
        if (!Array.isArray(content)) {
          this.boitiers = [];
        } else {
          this.boitiers = content.map((b: Boitier) => ({
            ...b,
            stat: b.etatBoitier === 'INSTALLED'
          }));
        }
        this.bigTotalItems = pageData?.totalElements || res.totalElements || res.total || (res.data?.totalElements || res.data?.total || content.length || 0);
        // Do not overwrite BOITIER_INSTALLED here, as res.totalElements is the search result count!
        this.refreshBoitierArchives();
        this.loadingInProgress = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingInProgress = false;
        this.cdr.detectChanges();
      }
    });
  }

  private refreshBoitierArchives() {
    this.boitiers.forEach(boitier => {
      this.boitierService.lastArchiveOfBoitier(boitier.numBoitier).subscribe((res: any) => {
        const arch = res.data || res;

        if (arch.dateLastTrame) {
          boitier.dateLastTrame = this.parseDateLastTrame(arch.dateLastTrame);
        }
        if (arch.emplacement) {
          boitier.emplacement = arch.emplacement;
        }
        boitier.latitude = arch.latitude;
        boitier.longitude = arch.longitude;
        boitier.vitesse = arch.vitesse;
        boitier.gpsLastTrame = arch.gpsLastTrame;
        boitier.gsmLastTrame = arch.gsmLastTrame;
        this.cdr.detectChanges();
      });
    });
  }

  private parseDateLastTrame(value: number | string): Date | undefined {
    if (typeof value === 'number') {
      return new Date(value);
    }
    if (typeof value === 'string') {
      if (value.includes('T')) {
        return new Date(value);
      }
      return this.parseDDMMYYYY(value);
    }
    return undefined;
  }

  private parseDDMMYYYY(dateStr: string): Date | undefined {
    const parts = dateStr.split(' ');
    if (parts.length !== 2) return undefined;

    const dateParts = parts[0].split('-');
    const timeParts = parts[1].split(':');
    if (dateParts.length !== 3 || timeParts.length !== 3) return undefined;

    return new Date(
      Number.parseInt(dateParts[2]),
      Number.parseInt(dateParts[1]) - 1,
      Number.parseInt(dateParts[0]),
      Number.parseInt(timeParts[0]),
      Number.parseInt(timeParts[1]),
      Number.parseInt(timeParts[2])
    );
  }

  searchBoitiers() {
    this.loadingInProgress = false; // Reset guard for search
    this.loadBoitierList();
  }

  onSelect(boitier: Boitier) {
    this.selectedBoitier = { ...boitier };
    this.updateForm.patchValue({
      label: boitier.label
    });
    if (this.updateBoitierModal) {
      this.updateBoitierModal.nativeElement.showModal();
    }
  }

  closeUpdateModal() {
    if (this.updateBoitierModal) {
      this.updateBoitierModal.nativeElement.close();
    }
  }

  updateBoitier() {
    this.selectedBoitier.label = this.updateForm.get('label')?.value;
    withToast(this.boitierService.updateBoitier(this.selectedBoitier, this.ID_COMPTE, "label"), this.toastr, this.translate, 'SERVER_DETAILS.UPDATE_SUCCESS')
      .subscribe({
        next: (res) => {
          const index = this.boitiers.findIndex(x => x.idBoitier === this.selectedBoitier.idBoitier);
          if (index !== -1) {
            this.boitiers[index] = { ...this.boitiers[index], label: res.label };
          }
          this.closeUpdateModal();
          this.cdr.detectChanges();
        },
        error: () => {
          this.cdr.detectChanges();
        }
      });
  }

  addBoitiers() {
    const nbrBoitiersToAdd = this.addForm.get('nbrBoitiers')?.value;
    if (this.BOITIER_NOT_INSTALLED < nbrBoitiersToAdd) {
      if (!confirm(this.translate.instant('SERVER_DETAILS.CONFIRM_NEW_INTERVAL'))) return;
    }
    this.addBoitierAfterConfirmation(nbrBoitiersToAdd);
  }

  private addBoitierAfterConfirmation(nbrBoitiersToAdd: number) {
    withToast(this.compteServerService.addBoitiers(this.ID_COMPTE, nbrBoitiersToAdd), this.toastr, this.translate, 'SERVER_DETAILS.DEVICES_ADDED')
      .subscribe({
        next: (res: any) => {
          this.mode = false;
          const data = res?.data || res;
          this.BOITIER_NOT_INSTALLED = data.compteServer.intervaleEnd - data.compteServer.intervaleStart + 1;
          this.intervalFrom = data.compteServer.intervaleStart;
          this.intervalTo = data.compteServer.intervaleEnd;
          this.loadCompteDetails();
          this.loadBoitierList();
          this.addForm.reset({ nbrBoitiers: 0 });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.mode = true;
          this.messageError = err.error?.message || this.translate.instant('COMMON.ERROR_OCCURRED');
          this.cdr.detectChanges();
        }
      });
  }

  extendIntervalOfBoitiers() {
    if (this.BOITIER_NOT_INSTALLED !== 0) {
      this.toastr.error(
        this.translate.instant('SERVER_DETAILS.CANNOT_EXTEND_AVAILABLE'), 
        this.translate.instant('COMMON.ERROR')
      );
      return;
    }

    if (confirm(this.translate.instant('SERVER_DETAILS.CONFIRM_EXTEND_ACCOUNT'))) {
      withToast(this.compteServerService.extendIntervalOfBoitiers(this.ID_COMPTE), this.toastr, this.translate, 'SERVER_DETAILS.INTERVAL_EXTENDED')
        .subscribe(res => {
          this.BOITIER_NOT_INSTALLED = res.intervaleEnd - res.intervaleStart + 1;
          this.cdr.detectChanges();
        });
    }
  }

  changeBoitierStatus(boitier: Boitier) {
    const updatedBoitier = { ...boitier, etatBoitier: 'INSTALLED' };
    withToast(this.boitierService.updateBoitier(updatedBoitier, this.ID_COMPTE, "etat"), this.toastr, this.translate, 'SERVER_DETAILS.DEVICE_INSTALLED')
      .subscribe({
        next: () => {
          const index = this.boitiers.findIndex(x => x.idBoitier === boitier.idBoitier);
          if (index !== -1) {
            this.boitiers[index].etatBoitier = 'INSTALLED';
            this.boitiers[index].stat = true;
          }
          this.BOITIER_INSTALLED++;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cdr.detectChanges();
        }
      });
  }
}
