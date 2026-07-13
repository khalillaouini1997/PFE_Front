import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {AccessLog} from 'src/app/data/data';
import {AccessLogService} from 'src/app/service/access-log.service';
import {createPaginationState, pageChanged} from '../../shared/components/pagination-base';

import {TableModule} from 'primeng/table';
import {TranslateModule} from '@ngx-translate/core';
import {PageHeaderComponent} from '../../shared/components/page-header/page-header.component';
import {SearchInputComponent} from '../../shared/components/search-input/search-input.component';
import {EmptyTableComponent} from '../../shared/components/empty-table/empty-table.component';

@Component({
  selector: 'app-access-log',
  standalone: true,
  templateUrl: './access-log.component.html',
  styleUrls: ['./access-log.component.css'],
  imports: [CommonModule, TableModule, DatePipe, TranslateModule, PageHeaderComponent, SearchInputComponent, EmptyTableComponent]
})
export class AccessLogComponent {

  loading: boolean = false;
  accessLogs: AccessLog[] = [];
  pagination = createPaginationState({itemsPerPage: 10});
  private currentKeyWord: string = '';

  private readonly accessLogService = inject(AccessLogService);
  private readonly cdr = inject(ChangeDetectorRef);

  onPageChanged(event: any): void {
    pageChanged(event, this.pagination);
    this.getAllAccessLogs(this.currentKeyWord, this.pagination.bigCurrentPage - 1, this.pagination.itemsPerPage);
  }

  getAllAccessLogs(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.accessLogs = [];
    this.accessLogService.getAllAccessLog(keyWord, page, size).subscribe({
      next: (_accessLogs: any) => {
        const responseData = _accessLogs?.data || _accessLogs;
        const content = responseData?.content || responseData || [];
        this.accessLogs = Array.isArray(content) ? content : [];
        this.pagination.bigTotalItems = responseData?.totalElements || responseData?.page?.totalElements || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  searchAccess(keyWord: string = '') {
    this.currentKeyWord = keyWord;
    this.pagination.bigCurrentPage = 1;
    this.getAllAccessLogs(keyWord, this.pagination.bigCurrentPage - 1, this.pagination.itemsPerPage);
  }
}
