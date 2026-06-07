import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdministratorCompte } from 'src/app/data/data';
import { AdminAccountService } from 'src/app/service/admin-account.service';
import { AuthService } from 'src/app/service/auth.service';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-compte-admin',
  standalone: true,
  templateUrl: './compte-admin.component.html',
  styleUrls: ['./compte-admin.component.css'],
  imports: [FormsModule, ReactiveFormsModule, TableModule, CommonModule, TranslateModule]
})
export class CompteAdminComponent implements OnInit {
  public maxSize: number = 5;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  itemsPerPage = 30;
  adminComptes: AdministratorCompte[] = [];
  loading: boolean = false;
  private loadingInProgress: boolean = false;
  searchForm!: FormGroup;

  private readonly router = inject(Router);
  private readonly adminAccountService = inject(AdminAccountService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.initForms();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    }
    // Initial load will be triggered by PrimeNG table's onLazyLoad
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });
  }

  getAllAdminComptes(keyWord: string, page: number, size: number) {
    if (this.loadingInProgress) return;
    this.loadingInProgress = true;
    this.loading = true;
    this.cdr.detectChanges();

    this.adminAccountService.getAllAdminComptesByKeyWord(keyWord, page, size)
      .subscribe({
        next: (res: any) => {
          const responseData = res?.data || res;
          const content = responseData?.content || responseData || [];
          this.adminComptes = Array.isArray(content) ? content : [];
          this.bigTotalItems = responseData?.totalElements || responseData?.page?.totalElements || 0;
          this.loading = false;
          this.loadingInProgress = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error occurred while fetching adminComptes:', error);
          this.loading = false;
          this.loadingInProgress = false;
          this.cdr.detectChanges();
        }
      });
  }

  searchWebAccount() {
    this.bigCurrentPage = 1;
    this.loadingInProgress = false; // Reset guard for explicit user action
    this.getAllAdminComptes(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  public pageChanged(event: any): void {
    if (event.first !== undefined && event.rows !== undefined) {
      this.bigCurrentPage = (event.first / event.rows) + 1;
      this.itemsPerPage = event.rows;
      this.loadingInProgress = false; // Reset guard for pagination
      this.getAllAdminComptes(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }
}
