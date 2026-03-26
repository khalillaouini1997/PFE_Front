import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdministratorCompte } from 'src/app/data/data';
import { AdminAccountService } from 'src/app/service/admin-account.service';
import { AuthService } from 'src/app/service/auth.service';
import { finalize } from "rxjs";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';


import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-compte-admin',
  standalone: true,
  templateUrl: './compte-admin.component.html',
  styleUrls: ['./compte-admin.component.css'],
  imports: [FormsModule, ReactiveFormsModule, TableModule, CommonModule]
})
export class CompteAdminComponent implements OnInit {
  public maxSize: number = 5;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  itemsPerPage = 30;
  adminComptes: AdministratorCompte[] = [];
  loading: boolean = false;
  searchForm!: FormGroup;

  private readonly router = inject(Router);
  private readonly adminAccountService = inject(AdminAccountService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  ngOnInit() {
    this.initForms();
    if (this.authService.isAuthenticated()) {
      this.getAllAdminComptes(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
    } else {
      this.router.navigate(['/error']);
    }
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });
  }

  getAllAdminComptes(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.adminComptes = [];

    this.adminAccountService.getAllAdminComptesByKeyWord(keyWord, page, size)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.adminComptes = res.content;
          this.bigTotalItems = res.totalElements;
        },
        error: (error) => {
          console.error('Error occurred while fetching adminComptes:', error);
        }
      });
  }

  searchWebAccount() {
    this.bigCurrentPage = 1;
    this.getAllAdminComptes(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  public pageChanged(event: any): void {
    if (event.first !== undefined && event.rows !== undefined) {
      this.bigCurrentPage = (event.first / event.rows) + 1;
      this.itemsPerPage = event.rows;
      this.getAllAdminComptes(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }
}
