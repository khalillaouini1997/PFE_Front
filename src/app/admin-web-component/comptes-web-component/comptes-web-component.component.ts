import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompteWeb } from 'src/app/data/data';
import { environment } from '../../../environments/environment';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from 'src/app/service/web-account.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-comptes-web-component',
  standalone: true,
  templateUrl: './comptes-web-component.component.html',
  styleUrls: ['./comptes-web-component.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TableModule, DatePipe, TranslateModule]
})
export class ComptesWebComponentComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  itemsPerPage = 30;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  public maxSize: number = 5;
  comptesWeb: CompteWeb[] = [];
  loading: boolean = false;
  selectedWebAccount: CompteWeb = new CompteWeb();
  dt: any;
  code_pays = [];

  searchForm!: FormGroup;

  owner: string = environment.owner;

  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.initForms();
      // Initially, we can wait for p-table's onLazyLoad to trigger the first fetch
      // But if it doesn't trigger immediately, we can call it. Usually p-table triggers it.
      // this.loadWebAccounts();
    } else {
      this.router.navigate(['/error']);
    }
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });
  }

  loadWebAccounts(event?: any) {
    this.loading = true;
    
    // Extract pagination parameters from the PrimeNG table event
    let page = 0;
    let size = this.itemsPerPage;
    
    if (event) {
      page = event.first ? Math.floor(event.first / event.rows) : 0;
      size = event.rows || this.itemsPerPage;
    }
    
    const keyWord = (this.searchForm?.get('keyWord')?.value || '').trim();

    this.webAccountService.getAllWebAccountByKeyWord(keyWord, page, size).subscribe({
      next: (res: any) => {
        this.loading = false;
        const loaded = res.content || [];
        
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
        this.bigTotalItems = res.totalElements || 0;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(
          this.translate.instant('WEB_ACCOUNTS.LOAD_ERROR'), 
          this.translate.instant('COMMON.ERROR')
        );
        this.cdr.markForCheck();
      }
    });
  }

  getDateLogF(username: string) {
    this.webAccountService.getDateLog(username).subscribe();
  }

  searchWebAccount() {
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
    this.cdr.markForCheck();
    this.router.navigate(['/adminWeb/configurations', compteWeb.idCompteClientWeb]);
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
          this.loadWebAccounts();
        },
        error: () => {
          this.toastr.error(
            this.translate.instant('WEB_ACCOUNTS.DELETE_ERROR'), 
            this.translate.instant('COMMON.ERROR')
          );
          this.cdr.markForCheck();
        }
      });
    }
  }
}
