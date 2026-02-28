import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Boitier, CompteServer } from 'src/app/data/data';
import { CompteServerService } from "../../service/compte-server.service";
import { BoitierService } from "../../service/boitier.service";
import { AuthService } from "../../service/auth.service";
import { ToastrService } from "ngx-toastr";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-compte-server-details',
  templateUrl: './compte-server-details.component.html',
  styleUrls: ['./compte-server-details.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, PaginationModule, DatePipe]
})
export class CompteServerDetailsComponent implements OnInit, OnDestroy {
  addForm!: FormGroup;
  searchForm!: FormGroup;
  paginationForm!: FormGroup;
  updateForm!: FormGroup;

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

  ngOnInit() {
    this.initForms();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
      return;
    }

    this.route.params.subscribe((params: Params) => {
      this.ID_COMPTE = +params['idCompteClientServer'];
      this.loadCompteDetails();
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
      this.compteServer = res;
      this.intervalFrom = res.intervaleStart;
      this.intervalTo = res.intervaleEnd;
      this.BOITIER_NOT_INSTALLED = res.intervaleEnd - res.intervaleStart + 1;
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
      this.BOITIER_INSTALLED = res.totalElements;
      this.refreshBoitierArchives();
    });
  }

  private refreshBoitierArchives() {
    this.boitiers.forEach(boitier => {
      this.boitierService.lastArchiveOfBoitier(boitier.numBoitier).subscribe((arch: any) => {
        boitier.dateLastTrame = arch.dateLastTrame;
        if (arch.latitude && arch.longitude) {
          boitier.emplacement = `${arch.latitude.toFixed(3)} : ${arch.longitude.toFixed(3)}`;
        }
        boitier.vitesse = arch.vitesse;
        boitier.gpsLastTrame = arch.gpsLastTrame;
        boitier.gsmLastTrame = arch.gsmLastTrame;
      });
    });
  }

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.loadBoitierList();
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
  }

  updateBoitier() {
    this.selectedBoitier.label = this.updateForm.get('label')?.value;
    this.boitierService.updateBoitier(this.selectedBoitier, this.ID_COMPTE, "label").subscribe({
      next: (res) => {
        const index = this.boitiers.findIndex(x => x.idBoitier === this.selectedBoitier.idBoitier);
        if (index !== -1) {
          this.boitiers[index] = { ...this.boitiers[index], label: res.label };
        }
        this.toastr.success(' Device updated ', 'Success!');
      },
      error: () => this.toastr.error('There is a mistake', 'Error!')
    });
  }

  addBoitiers() {
    const nbrBoitiersToAdd = this.addForm.get('nbrBoitiers')?.value;
    if (this.BOITIER_NOT_INSTALLED < nbrBoitiersToAdd) {
      if (!confirm("Vous êtes sur de vouloir ajouter une nouvelle intervalle libre ?")) return;
    }
    this.addBoitierAfterConfirmation(nbrBoitiersToAdd);
  }

  private addBoitierAfterConfirmation(nbrBoitiersToAdd: number) {
    this.boitierService.addBoitiers(this.ID_COMPTE, nbrBoitiersToAdd).subscribe({
      next: (res: any) => {
        this.mode = false;
        this.BOITIER_NOT_INSTALLED = res.compteserver.intervaleEnd - res.compteserver.intervaleStart + 1;
        this.intervalFrom = res.compteserver.intervaleStart;
        this.intervalTo = res.compteserver.intervaleEnd;
        this.loadBoitierList();
        this.toastr.success(nbrBoitiersToAdd + ' devices added', 'Success!');
        this.addForm.reset({ nbrBoitiers: 0 });
      },
      error: (err) => {
        this.mode = true;
        this.messageError = err.error?.message || "An error occurred";
        this.toastr.error('There is a mistake', 'Error!');
      }
    });
  }

  extendIntervalOfBoitiers() {
    if (this.BOITIER_NOT_INSTALLED !== 0) {
      this.toastr.error('you cannot extend this interval because there are more devices available', 'Error!');
      return;
    }

    if (confirm("are you sure that you want extend this Account ?")) {
      this.compteServerService.extendIntervalOfBoitiers(this.ID_COMPTE).subscribe(res => {
        this.BOITIER_NOT_INSTALLED = res.intervaleEnd - res.intervaleStart + 1;
        this.toastr.success('interval extended', 'Success!');
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
        this.toastr.success(' Device is Installed now ', 'Success!');
      },
      error: () => this.toastr.error('Table of this server does not exist', 'Error!')
    });
  }
}
