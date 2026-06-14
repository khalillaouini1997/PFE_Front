import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompteWeb, createCompteWeb } from 'src/app/data/data';
import { environment } from '../../../environments/environment';

import { WebAccountService } from 'src/app/service/web-account.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { STORAGE_KEYS } from 'src/app/shared/constants';


import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-comptes-web-component',
  standalone: true,
  templateUrl: './comptes-web-component.component.html',
  styleUrls: ['./comptes-web-component.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TableModule, DatePipe, TranslateModule]
})
export class ComptesWebComponentComponent implements OnInit {
  itemsPerPage = 30;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  public maxSize: number = 5;
  comptesWeb: CompteWeb[] = [];
  loading: boolean = false;
  private loadingInProgress: boolean = false;
  selectedWebAccount: CompteWeb = createCompteWeb();
  dt: any;
  code_pays = [];

  searchForm!: FormGroup;
  availablePools: number[] = [];

  get regionControl() {
    return this.searchForm.get('region') as any;
  }

  get poolControl() {
    return this.searchForm.get('pool') as any;
  }

  owner: string = environment.owner;

  private readonly webAccountService = inject(WebAccountService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    if (localStorage.getItem(STORAGE_KEYS.IS_RELOADING) === 'true') {
      localStorage.removeItem(STORAGE_KEYS.IS_RELOADING);
      globalThis.location.reload();
      return;
    }
    this.initForms();
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: [''],
      region: [''],
      pool: ['']
    });
    this.loadAvailablePools();
    this.loadWebAccounts();
  }

  loadWebAccounts(event?: any) {
    if (this.loadingInProgress) return;
    this.loadingInProgress = true;
    this.loading = true;
    this.cdr.detectChanges();

    // Extract pagination parameters from the PrimeNG table event
    let page = 0;
    let size = this.itemsPerPage;

    if (event) {
      page = event.first ? Math.floor(event.first / event.rows) : 0;
      size = event.rows || this.itemsPerPage;
    }

    const keyWord = (this.searchForm?.get('keyWord')?.value || '').trim();
    const region = this.searchForm?.get('region')?.value || '';
    const pool = this.searchForm?.get('pool')?.value ? parseInt(this.searchForm?.get('pool')?.value) : undefined;

    this.webAccountService.getAllWebAccountByKeyWord(keyWord, page, size, region, pool).subscribe({
      next: (res: any) => {
        const responseData = res?.data || res;
        const totalElements = responseData?.page?.totalElements || responseData?.totalElements || 0;
        const loaded = responseData?.content || [];

        for (const compte of loaded) {
          if (Date.now() < new Date(compte.date_expiration).getTime()) {
            compte.expired = false;
            compte.during = true;
          } else {
            compte.expired = true;
            compte.during = false;
          }
        }

        this.comptesWeb = loaded;
        this.bigTotalItems = totalElements;
        this.loading = false;
        this.loadingInProgress = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.loadingInProgress = false;
        this.cdr.detectChanges();
        this.toastr.error(
          this.translate.instant('WEB_ACCOUNTS.LOAD_ERROR'),
          this.translate.instant('COMMON.ERROR')
        );
      }
    });
  }

  getDateLogF(username: string) {
    this.webAccountService.getDateLog(username).subscribe();
  }

  searchWebAccount() {
    this.loadingInProgress = false; // Reset guard for explicit user action
    this.loadWebAccounts();
  }

  onSelect(compteWeb: CompteWeb) {
    this.selectedWebAccount = compteWeb;
    const dateDecop = new Date(this.selectedWebAccount.date_expiration);
    if (dateDecop.getUTCHours() == 23) {
      dateDecop.setHours(dateDecop.getHours() + 1);
    }
    this.dt = {
      date: { year: dateDecop.getFullYear(), month: dateDecop.getUTCMonth() + 1, day: dateDecop.getUTCDate() },
      jsdate: dateDecop
    };
    this.router.navigate(['/adminWeb/configurations', compteWeb.idCompteClientWeb]);
  }

  loadAvailablePools() {
    this.webAccountService.getDistinctPools().subscribe({
      next: (pools: any) => {
        const responseData = pools?.data || pools;
        const poolsArray = Array.isArray(responseData) ? responseData : (responseData?.content || []);
        this.availablePools = poolsArray.sort((a, b) => a - b);
      },
      error: (err) => {
      }
    });
  }

  deleteWebAccount() {
    const res = confirm(this.translate.instant('WEB_ACCOUNTS.DELETE_CONFIRM'));
    if (res) {
      this.webAccountService.deleteWebAccount(this.selectedWebAccount.idCompteClientWeb).subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('WEB_ACCOUNTS.DELETE_SUCCESS'), 
            this.translate.instant('COMMON.SUCCESS')
          );
          this.loadingInProgress = false; // Reset guard for reload after delete
          this.loadWebAccounts();
        },
        error: () => {
          this.toastr.error(
            this.translate.instant('WEB_ACCOUNTS.DELETE_ERROR'), 
            this.translate.instant('COMMON.ERROR')
          );
        }
      });
    }
  }
}
