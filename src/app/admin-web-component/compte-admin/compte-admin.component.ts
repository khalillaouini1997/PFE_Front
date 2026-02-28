import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorCompte } from 'src/app/data/data';
import { AdminAccountService } from 'src/app/service/admin-account.service';
import { AuthService } from 'src/app/service/auth.service';
import { finalize } from "rxjs";
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-compte-admin',
  templateUrl: './compte-admin.component.html',
  styleUrls: ['./compte-admin.component.css'],
  standalone: true,
  imports: [FormsModule, PaginationModule]
})
export class CompteAdminComponent implements OnInit {
  keyWord: string = "";
  public maxSize: number = 5;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  itemsPerPage = 30;
  adminComptes: AdministratorCompte[] = [];
  loading: boolean = false;

  private readonly router = inject(Router);
  private readonly adminAccountService = inject(AdminAccountService);
  private readonly authService = inject(AuthService);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    } else {
      this.getAllAdminComptes(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
    }
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
    this.getAllAdminComptes(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllAdminComptes(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }
}
