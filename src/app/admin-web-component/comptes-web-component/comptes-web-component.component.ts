import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompteWeb } from 'src/app/data/data';
import { environment } from '../../../environments/environment';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from 'src/app/service/web-account.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-comptes-web-component',
  templateUrl: './comptes-web-component.component.html',
  styleUrls: ['./comptes-web-component.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, PaginationModule, DatePipe]
})
export class ComptesWebComponentComponent implements OnInit {
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

  ngOnInit() {
    this.initForms();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    } else {
      this.getAllWebAccount(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });
  }

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllWebAccount(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  getAllWebAccount(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.comptesWeb = [];
    this.webAccountService.getAllWebAccountByKeyWord(keyWord, page, size).subscribe({
      next: (_comptesWeb) => {
        this.loading = false;
        this.comptesWeb = _comptesWeb.content as any;

        for (let i = 0; i < this.comptesWeb.length; i++) {
          if (new Date().getTime() < new Date(this.comptesWeb[i].date_expiration).getTime()) {
            this.comptesWeb[i].expired = false;
            this.comptesWeb[i].during = true;
          } else {
            this.comptesWeb[i].expired = true;
            this.comptesWeb[i].during = false;
          }
        }
        this.bigTotalItems = _comptesWeb.totalElements;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Error loading web accounts', 'Error');
      }
    });
  }

  getDateLogF(username: string) {
    this.webAccountService.getDateLog(username).subscribe();
  }

  searchWebAccount() {
    this.loading = true;
    this.bigCurrentPage = 1;
    this.getAllWebAccount(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
    this.loading = false;
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
  }

  deleteWebAccount() {
    const res = confirm("are you sure that you want to delete this Account ?");
    if (res) {
      const indexCompte = this.comptesWeb.findIndex(x => x.idCompteClientWeb == this.selectedWebAccount.idCompteClientWeb);
      this.webAccountService.deleteWebAccount(this.selectedWebAccount.idCompteClientWeb).subscribe({
        next: () => {
          this.toastr.success(' Account was deleted ', 'Success!');
          if (indexCompte > -1) {
            this.comptesWeb.splice(indexCompte, 1);
          }
        },
        error: () => {
          this.toastr.error(' Account was not deleted ', 'Error!');
        }
      });
    }
  }
}
