import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdministratorCompte} from 'src/app/data/data';
import {AdminAccountService} from 'src/app/service/admin-account.service';
import {AuthService} from 'src/app/service/auth.service';
import {createPaginationState, pageChanged} from '../../shared/components/pagination-base';

import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';
import {withToast} from '../../utils/toast.helpers';

import {TableModule} from 'primeng/table';
import {PageHeaderComponent} from '../../shared/components/page-header/page-header.component';
import {SearchInputComponent} from '../../shared/components/search-input/search-input.component';
import {EmptyTableComponent} from '../../shared/components/empty-table/empty-table.component';

@Component({
  selector: 'app-compte-admin',
  standalone: true,
  templateUrl: './compte-admin.component.html',
  styleUrls: ['./compte-admin.component.css'],
  imports: [CommonModule, TableModule, TranslateModule, PageHeaderComponent, SearchInputComponent, EmptyTableComponent]
})
export class CompteAdminComponent {
  pagination = createPaginationState();
  adminComptes: AdministratorCompte[] = [];
  loading: boolean = false;
  private loadingInProgress: boolean = false;

  private readonly adminAccountService = inject(AdminAccountService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  canDelete(): boolean {
    return this.authService.hasRole('GLOBALADMINDESC');
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
          this.pagination.bigTotalItems = responseData?.totalElements || responseData?.page?.totalElements || 0;
          this.loading = false;
          this.loadingInProgress = false;
          this.cdr.detectChanges();
        },
        error: (_error) => {
          this.loading = false;
          this.loadingInProgress = false;
          this.cdr.detectChanges();
        }
      });
  }

  searchWebAccount(keyWord: string = '') {
    this.pagination.bigCurrentPage = 1;
    this.loadingInProgress = false;
    this.getAllAdminComptes(keyWord, this.pagination.bigCurrentPage - 1, this.pagination.itemsPerPage);
  }

  onPageChanged(event: any): void {
    pageChanged(event, this.pagination);
    this.loadingInProgress = false;
    this.getAllAdminComptes('', this.pagination.bigCurrentPage - 1, this.pagination.itemsPerPage);
  }

  deleteAdminCompte(adminCompte: AdministratorCompte) {
    const res = confirm(this.translate.instant('ADMIN_ACCOUNTS.DELETE_CONFIRM'));
    if (res) {
      withToast(this.adminAccountService.deleteAdminCompte(adminCompte.idAdministratorCompte), this.toastr, this.translate, 'ADMIN_ACCOUNTS.DELETE_SUCCESS')
        .subscribe({
          next: () => {
            this.adminComptes = this.adminComptes.filter(x => x.idAdministratorCompte !== adminCompte.idAdministratorCompte);
            this.pagination.bigTotalItems--;
            this.loadingInProgress = false;
            this.cdr.detectChanges();
          },
          error: () => {
          }
        });
    }
  }
}
