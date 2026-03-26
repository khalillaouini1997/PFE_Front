import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompteWeb } from 'src/app/data/data';
import { environment } from '../../../environments/environment';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from 'src/app/service/web-account.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';


import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-comptes-web-component',
  standalone: true,
  templateUrl: './comptes-web-component.component.html',
  styleUrls: ['./comptes-web-component.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TableModule, DatePipe]
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

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.initForms();
    } else {
      this.router.navigate(['/error']);
    }
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });
  }

  public pageChanged(event: any): void {
    if (event.first !== undefined && event.rows !== undefined) {
      this.bigCurrentPage = (event.first / event.rows) + 1;
      this.itemsPerPage = event.rows;
      this.getAllWebAccount(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }

  getAllWebAccount(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.comptesWeb = [];
    this.cdr.markForCheck();
    this.webAccountService.getAllWebAccountByKeyWord(keyWord, page, size).subscribe({
      next: (_comptesWeb) => {
        this.loading = false;
        this.comptesWeb = _comptesWeb.content as any;

        for (const compte of this.comptesWeb) {
          if (Date.now() < new Date(compte.date_expiration).getTime()) {
            compte.expired = false;
            compte.during = true;
          } else {
            compte.expired = true;
            compte.during = false;
          }
        }
        this.bigTotalItems = _comptesWeb.totalElements;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Error loading web accounts', 'Error');
        this.cdr.markForCheck();
      }
    });
  }

  getDateLogF(username: string) {
    this.webAccountService.getDateLog(username).subscribe();
  }

  searchWebAccount() {
    this.loading = true;
    this.bigCurrentPage = 1;
    this.cdr.markForCheck();
    this.getAllWebAccount(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
    this.loading = false;
    this.cdr.markForCheck();
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
    const res = confirm("are you sure that you want to delete this Account ?");
    if (res) {
      const indexCompte = this.comptesWeb.findIndex(x => x.idCompteClientWeb == this.selectedWebAccount.idCompteClientWeb);
      this.webAccountService.deleteWebAccount(this.selectedWebAccount.idCompteClientWeb).subscribe({
        next: () => {
          this.toastr.success(' Account was deleted ', 'Success!');
          if (indexCompte > -1) {
            this.comptesWeb.splice(indexCompte, 1);
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.toastr.error(' Account was not deleted ', 'Error!');
          this.cdr.markForCheck();
        }
      });
    }
  }
}
