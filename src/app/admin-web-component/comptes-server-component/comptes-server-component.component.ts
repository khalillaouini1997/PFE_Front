import { ChangeDetectorRef, Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { saveAs as importedSaveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { CompteServer, IpAddress } from 'src/app/data/data';
import { CompteServerService } from "../../service/compte-server.service";
import { IpAddressService } from "../../service/ip-address.service";
import { AuthService } from "../../service/auth.service";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-comptes-server-component',
  standalone: true,
  templateUrl: './comptes-server-component.component.html',
  styleUrls: ['./comptes-server-component.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TableModule, BsDatepickerModule, TranslateModule]
})
export class ComptesServerComponentComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('updateModal') updateModal!: ElementRef<HTMLDialogElement>;

  keyWord: string = "";
  public maxSize: number = 5;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  itemsPerPage = 30;
  comptesServer: CompteServer[] = [];
  loading: boolean = false;
  dt: Date = new Date();
  mode: boolean = false;
  messageError: string = "";
  ips: IpAddress[] = [];

  searchForm!: FormGroup;
  updateServerForm!: FormGroup;

  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly compteServerService = inject(CompteServerService);
  private readonly ipAddressService = inject(IpAddressService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  ngOnInit() {
    this.initForms();
    if (this.authService.isAuthenticated()) {
      this.ipAddressService.getAllIps().subscribe(res => {
        this.ips = res;
        this.cdr.markForCheck();
      });
    } else {
      this.router.navigate(['/error']);
    }
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });

    this.updateServerForm = this.fb.group({
      idCompteClientServer: [null],
      pseudo: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', Validators.required],
      idIpAdresse: [null, Validators.required]
    });
  }

  public pageChanged(event: any): void {
    if (event.first !== undefined && event.rows !== undefined) {
      this.bigCurrentPage = (event.first / event.rows) + 1;
      this.itemsPerPage = event.rows;
      this.getAllcompteServer(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }

  getAllcompteServer(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.comptesServer = [];
    this.cdr.markForCheck();
    this.compteServerService.getAllServerAccount(keyWord, page, size).subscribe({
      next: (_comptesServer) => {
        this.comptesServer = _comptesServer.content;
        const now = Date.now();
        this.comptesServer.forEach(s => {
          s.expired = now >= s.date_Expiration;
          s.during = !s.expired;
        });
        this.bigTotalItems = _comptesServer.totalElements;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  searchAccount() {
    this.bigCurrentPage = 1;
    this.getAllcompteServer(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
  }

  onExport() {
    if (this.comptesServer.length <= 0) return;

    this.compteServerService.ExportListComptesServer(this.comptesServer)
      .subscribe(blob => {
        importedSaveAs(blob, this.translate.instant('SERVER_ACCOUNTS.REPORT_FILENAME'));
      });
  }

  deleteCompteServer() {
    const selectedId = this.updateServerForm.get('idCompteClientServer')?.value;
    if (selectedId && confirm(this.translate.instant('WEB_ACCOUNTS.DELETE_CONFIRM'))) {
      this.compteServerService.deleteCompteServer(selectedId).subscribe({
        next: () => {
          this.comptesServer = this.comptesServer.filter(x => x.idCompteClientServer !== selectedId);
          this.toastr.success(
            this.translate.instant('SERVER_ACCOUNTS.DELETE_SUCCESS'), 
            this.translate.instant('COMMON.SUCCESS')
          );
        },
        error: () => {
          this.toastr.error(
            this.translate.instant('SERVER_ACCOUNTS.DELETE_ERROR'), 
            this.translate.instant('COMMON.ERROR')
          );
        }
      });
    }
  }

  updateCompteServer() {
    const updatedCompte = { ...this.updateServerForm.value, date_Expiration: this.dt.getTime() };
    this.compteServerService.updateServerCompte(updatedCompte.idCompteClientServer, updatedCompte).subscribe({
      next: (_compteUp: any) => {
        this.mode = false;
        const now = Date.now();
        _compteUp.expired = now >= _compteUp.date_Expiration;
        _compteUp.during = !_compteUp.expired;

        const index = this.comptesServer.findIndex(x => x.idCompteClientServer === _compteUp.idCompteClientServer);
        if (index !== -1) {
          this.comptesServer[index] = _compteUp;
        }
        this.toastr.success(
          this.translate.instant('SERVER_ACCOUNTS.UPDATE_SUCCESS'), 
          this.translate.instant('COMMON.SUCCESS')
        );
        this.closeUpdateModal();
      },
      error: (error) => {
        this.mode = true;
        this.messageError = error.error?.message || this.translate.instant('COMMON.AN_ERROR_OCCURRED');
      }
    });
  }

  onSelect(compteServer: CompteServer) {
    this.updateServerForm.patchValue(compteServer);
    this.dt = new Date(compteServer.date_Expiration);
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
