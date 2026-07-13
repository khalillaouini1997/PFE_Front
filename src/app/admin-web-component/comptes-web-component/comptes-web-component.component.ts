import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {CompteWeb, createCompteWeb} from 'src/app/data/data';
import {environment} from '../../../environments/environment';

import {WebAccountService} from 'src/app/service/web-account.service';
import {AuthService} from 'src/app/service/auth.service';
import {createPaginationState, pageChanged} from '../../shared/components/pagination-base';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {STORAGE_KEYS} from 'src/app/shared/constants';
import {withToast} from '../../utils/toast.helpers';


import {TableModule} from 'primeng/table';
import {PageHeaderComponent} from '../../shared/components/page-header/page-header.component';
import {SearchInputComponent} from '../../shared/components/search-input/search-input.component';
import {EmptyTableComponent} from '../../shared/components/empty-table/empty-table.component';

@Component({
  selector: 'app-comptes-web-component',
  standalone: true,
  templateUrl: './comptes-web-component.component.html',
  styleUrls: ['./comptes-web-component.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TableModule, DatePipe, TranslateModule, PageHeaderComponent, SearchInputComponent, EmptyTableComponent]
})
export class ComptesWebComponentComponent implements OnInit {
  pagination = createPaginationState();
  comptesWeb: CompteWeb[] = [];
  loading: boolean = false;
  selectedWebAccount: CompteWeb = createCompteWeb();
  dt: any;
  code_pays = [];
  searchForm!: FormGroup;
  availablePools: number[] = [];
  owner: string = environment.owner;
  private loadingInProgress: boolean = false;
  private currentKeyWord: string = '';
  private readonly webAccountService = inject(WebAccountService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  get regionControl() {
    return this.searchForm.get('region') as any;
  }

  get poolControl() {
    return this.searchForm.get('pool') as any;
  }

  canDelete(): boolean {
    return this.authService.hasRole('GLOBALADMINDESC');
  }

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

    let page = this.pagination.bigCurrentPage - 1;
    let size = this.pagination.itemsPerPage;

    if (event) {
      page = event.first ? Math.floor(event.first / event.rows) : 0;
      size = event.rows || this.pagination.itemsPerPage;
    }

    const keyWord = this.currentKeyWord;
    const region = this.searchForm?.get('region')?.value || '';
    const pool = this.searchForm?.get('pool')?.value ? Number.parseInt(this.searchForm?.get('pool')?.value) : undefined;

    this.webAccountService.getAllWebAccountByKeyWord(keyWord, page, size, region, pool).subscribe({
      next: (res: any) => {
        const responseData = res?.data || res;
        const totalElements = responseData?.page?.totalElements || responseData?.totalElements || 0;
        const loaded = responseData?.content || (Array.isArray(responseData) ? responseData : []);

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
        this.pagination.bigTotalItems = totalElements;
        this.loading = false;
        this.loadingInProgress = false;
        this.cdr.detectChanges();
      },
      error: (_err) => {
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

  onPageChanged(event: any): void {
    pageChanged(event, this.pagination);
    this.loadingInProgress = false;
    this.loadWebAccounts();
  }

  getDateLogF(username: string) {
    this.webAccountService.getDateLog(username).subscribe();
  }

  searchWebAccount(keyWord: string = '') {
    this.currentKeyWord = keyWord;
    this.pagination.bigCurrentPage = 1;
    this.loadingInProgress = false;
    this.loadWebAccounts();
  }

  onSelect(compteWeb: CompteWeb) {
    this.selectedWebAccount = compteWeb;
    const dateDecop = new Date(this.selectedWebAccount.date_expiration);
    if (dateDecop.getUTCHours() == 23) {
      dateDecop.setHours(dateDecop.getHours() + 1);
    }
    this.dt = {
      date: {year: dateDecop.getFullYear(), month: dateDecop.getUTCMonth() + 1, day: dateDecop.getUTCDate()},
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
      error: (_err) => {
      }
    });
  }

  deleteWebAccount() {
    const res = confirm(this.translate.instant('WEB_ACCOUNTS.DELETE_CONFIRM'));
    if (res) {
      withToast(this.webAccountService.deleteWebAccount(this.selectedWebAccount.idCompteClientWeb), this.toastr, this.translate, 'WEB_ACCOUNTS.DELETE_SUCCESS')
        .subscribe({
          next: () => {
            this.loadingInProgress = false;
            this.loadWebAccounts();
          },
          error: () => {
          }
        });
    }
  }
}
