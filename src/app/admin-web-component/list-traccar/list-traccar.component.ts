import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TraccarDto } from 'src/app/data/data';
import { TraccarService } from 'src/app/service/traccar.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { EmptyTableComponent } from '../../shared/components/empty-table/empty-table.component';

@Component({
    selector: 'app-list-traccar',
    standalone: true,
    templateUrl: './list-traccar.component.html',
    styleUrls: ['./list-traccar.component.css'],
    imports: [CommonModule, TableModule, TranslateModule, PageHeaderComponent, SearchInputComponent, EmptyTableComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListTraccarComponent implements OnInit, OnDestroy {

  private readonly traccarService = inject(TraccarService);
  private readonly toastr = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);

  traccarDtos: TraccarDto[] = [];
  loading: boolean = false;
  totalRecords: number = 0;

  ngOnInit() {
    this.getLisTraccar();
  }

  getLisTraccar(keyword: string = '') {
    this.loading = true;
    this.traccarService.getLisTraccar(keyword).subscribe({
      next: (traccarDto: any) => {
        const responseData = traccarDto?.data || traccarDto;
        const data = Array.isArray(responseData) ? responseData : (responseData?.content || []);
        if (!data || data.length === 0) {
          this.traccarDtos = [];
          this.totalRecords = 0;
          this.toastr.warning(this.translate.instant('TRACCAR.NO_CONFIGURED'), this.translate.instant('COMMON.WARNING'));
        } else {
          this.traccarDtos = data;
          this.totalRecords = data?.length || 0;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toastr.error(this.translate.instant('TRACCAR.LOAD_ERROR'), this.translate.instant('COMMON.ERROR'));
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  searchWebAccount(keyword: string = '') {
    this.getLisTraccar(keyword);
  }

  ngOnDestroy() {
    this.traccarDtos = [];
    this.totalRecords = 0;
  }
}
