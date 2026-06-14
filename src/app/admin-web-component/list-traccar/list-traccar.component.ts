import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TraccarDto } from 'src/app/data/data';
import { TraccarService } from 'src/app/service/traccar.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { EmptyTableComponent } from '../../shared/components/empty-table/empty-table.component';

@Component({
    selector: 'app-list-traccar',
    standalone: true,
    templateUrl: './list-traccar.component.html',
    styleUrls: ['./list-traccar.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, TranslateModule, PageHeaderComponent, SearchInputComponent, EmptyTableComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListTraccarComponent implements OnInit, OnDestroy {

  private readonly traccarService = inject(TraccarService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);

  searchForm!: FormGroup;
  traccarDtos: TraccarDto[] = [];
  loading: boolean = false;
  totalRecords: number = 0;

  ngOnInit() {
    this.initForms();
    this.getLisTraccar();
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });
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
          this.toastr.warning('Aucun Traccar configuré pour cet utilisateur', 'Information');
        } else {
          this.traccarDtos = data;
          this.totalRecords = data?.length || 0;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement des Traccars', 'Erreur');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  searchWebAccount(keyword: string = '') {
    this.getLisTraccar(keyword);
  }

  ngOnDestroy() {
    this.searchForm?.reset();
    this.traccarDtos = [];
    this.totalRecords = 0;
  }
}
