import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { Boitier, BoitierRealTime, CompteServer } from 'src/app/data/data';
import { CompteServerService } from "../../service/compte-server.service";
import { BoitierService } from "../../service/boitier.service";
import { AuthService } from "../../service/auth.service";
import { ToastrService } from "ngx-toastr";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CommonModule, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-compte-server-details',
    standalone: true,
    templateUrl: './compte-server-details.component.html',
    styleUrls: ['./compte-server-details.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, DatePipe, DecimalPipe, NgClass, RouterModule, TranslateModule]
})
export class CompteServerDetailsComponent implements OnInit, OnDestroy {
  addForm!: FormGroup;
  searchForm!: FormGroup;
  paginationForm!: FormGroup;
  updateForm!: FormGroup;
  @ViewChild('updateBoitierModal') updateBoitierModal!: ElementRef<HTMLDialogElement>;

  private refreshInterval: any;
  compteServer: CompteServer = new CompteServer();
  boitiers: Boitier[] = [];
  boitiersInvalid: Boitier[] = [];
  BOITIER_INSTALLED: number = 0;
  BOITIER_NOT_INSTALLED: number = 0;
  selectedBoitier: Boitier = new Boitier();
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

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly compteServerService = inject(CompteServerService);
  private readonly boitierService = inject(BoitierService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);

  ngOnInit() {
    this.initForms();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
      return;
    }

    this.route.params.subscribe((params: Params) => {
      this.ID_COMPTE = +params['idCompteClientServer'];
      this.loadCompteDetails();
      // loadBoitierList() is called by PrimeNG table's onLazyLoad event
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
      this.compteServer = res;
      this.intervalFrom = res.intervaleStart;
      this.intervalTo = res.intervaleEnd;
      this.BOITIER_NOT_INSTALLED = res.intervaleEnd - res.intervaleStart + 1;
      if (res.installedBoitiersCount !== undefined) {
        this.BOITIER_INSTALLED = res.installedBoitiersCount;
      }
      this.cdr.markForCheck();
    });
  }

  private loadBoitierList() {
    const keyword = this.searchForm.get('searchBoitier')?.value;
    this.boitierService.getBoitierOfAccount(this.ID_COMPTE, keyword, this.bigCurrentPage - 1, this.itemsPerPage).subscribe(res => {
      this.boitiers = res.content.map((b: Boitier) => ({
        ...b,
        stat: b.etatBoitier === 'INSTALLED'
      }));
      this.bigTotalItems = res.totalElements;
      // Do not overwrite BOITIER_INSTALLED here, as res.totalElements is the search result count!
      this.refreshBoitierArchives();
      this.cdr.markForCheck();
    });
  }

  private refreshBoitierArchives() {
    this.boitiers.forEach(boitier => {
      this.boitierService.lastArchiveOfBoitier(boitier.numBoitier).subscribe((arch: BoitierRealTime) => {
        // Handle dateLastTrame - could be timestamp (number) or string
        if (arch.dateLastTrame) {
          if (typeof arch.dateLastTrame === 'number') {
            // It's a timestamp
            boitier.dateLastTrame = new Date(arch.dateLastTrame);
          } else if (typeof arch.dateLastTrame === 'string') {
            // Parse date from DD-MM-YYYY HH:mm:ss format to Date object
            const parts = arch.dateLastTrame.split(' ');
            if (parts.length === 2) {
              const dateParts = parts[0].split('-');
              const timeParts = parts[1].split(':');
              if (dateParts.length === 3 && timeParts.length === 3) {
                boitier.dateLastTrame = new Date(
                  parseInt(dateParts[2]), // year
                  parseInt(dateParts[1]) - 1, // month (0-indexed)
                  parseInt(dateParts[0]), // day
                  parseInt(timeParts[0]), // hours
                  parseInt(timeParts[1]), // minutes
                  parseInt(timeParts[2]) // seconds
                );
              }
            }
          }
        }
        if (arch.emplacement) {
          boitier.emplacement = arch.emplacement;
        } else if (arch.vitesse !== undefined) {
          // Fallback if needed, but BoitierRealTime should have it
        }
        boitier.latitude = arch.latitude;
        boitier.longitude = arch.longitude;
        boitier.vitesse = arch.vitesse;
        boitier.gpsLastTrame = arch.gpsLastTrame;
        boitier.gsmLastTrame = arch.gsmLastTrame;
        this.cdr.markForCheck();
      });
    });
  }

  public pageChanged(event: any): void {
    if (event.first !== undefined && event.rows !== undefined) {
      this.bigCurrentPage = (event.first / event.rows) + 1;
      this.itemsPerPage = event.rows;
      this.loadBoitierList();
    }
  }

  searchBoitiers() {
    this.bigCurrentPage = 1;
    this.paginationForm.get('bigCurrentPage')?.setValue(1, { emitEvent: false });
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
    this.boitierService.updateBoitier(this.selectedBoitier, this.ID_COMPTE, "label").subscribe({
      next: (res) => {
        const index = this.boitiers.findIndex(x => x.idBoitier === this.selectedBoitier.idBoitier);
        if (index !== -1) {
          this.boitiers[index] = { ...this.boitiers[index], label: res.label };
        }
        this.toastr.success(
          this.translate.instant('SERVER_DETAILS.UPDATE_SUCCESS'), 
          this.translate.instant('COMMON.SUCCESS')
        );
        this.closeUpdateModal();
        this.cdr.markForCheck();
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('COMMON.ERROR_OCCURRED'), 
          this.translate.instant('COMMON.ERROR')
        );
        this.cdr.markForCheck();
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
    this.boitierService.addBoitiers(this.ID_COMPTE, nbrBoitiersToAdd).subscribe({
      next: (res: any) => {
        this.mode = false;
        this.BOITIER_NOT_INSTALLED = res.compteServer.intervaleEnd - res.compteServer.intervaleStart + 1;
        this.intervalFrom = res.compteServer.intervaleStart;
        this.intervalTo = res.compteServer.intervaleEnd;
        this.loadCompteDetails();
        this.loadBoitierList();
        this.toastr.success(
          nbrBoitiersToAdd + ' ' + this.translate.instant('SERVER_DETAILS.DEVICES_ADDED'), 
          this.translate.instant('COMMON.SUCCESS')
        );
        this.addForm.reset({ nbrBoitiers: 0 });
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mode = true;
        this.messageError = err.error?.message || this.translate.instant('COMMON.ERROR_OCCURRED');
        this.toastr.error(
          this.translate.instant('COMMON.ERROR_OCCURRED'), 
          this.translate.instant('COMMON.ERROR')
        );
        this.cdr.markForCheck();
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
      this.compteServerService.extendIntervalOfBoitiers(this.ID_COMPTE).subscribe(res => {
        this.BOITIER_NOT_INSTALLED = res.intervaleEnd - res.intervaleStart + 1;
        this.toastr.success(
          this.translate.instant('SERVER_DETAILS.INTERVAL_EXTENDED'), 
          this.translate.instant('COMMON.SUCCESS')
        );
        this.cdr.markForCheck();
      });
    }
  }

  changeBoitierStatus(boitier: Boitier) {
    const updatedBoitier = { ...boitier, etatBoitier: 'INSTALLED' };
    this.boitierService.updateBoitier(updatedBoitier, this.ID_COMPTE, "etat").subscribe({
      next: () => {
        const index = this.boitiers.findIndex(x => x.idBoitier === boitier.idBoitier);
        if (index !== -1) {
          this.boitiers[index].etatBoitier = 'INSTALLED';
          this.boitiers[index].stat = true;
        }
        this.BOITIER_INSTALLED++;
        this.toastr.success(
          this.translate.instant('SERVER_DETAILS.DEVICE_INSTALLED'), 
          this.translate.instant('COMMON.SUCCESS')
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('SERVER_DETAILS.TABLE_NOT_EXIST'), 
          this.translate.instant('COMMON.ERROR')
        );
        this.cdr.markForCheck();
      }
    });
  }
}
