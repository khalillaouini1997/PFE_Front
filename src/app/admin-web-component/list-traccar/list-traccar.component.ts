import { Component, OnInit, inject } from '@angular/core';
import { TraccarDto } from 'src/app/data/data';
import { TraccarService } from 'src/app/service/traccar.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-list-traccar',
    standalone: true,
    templateUrl: './list-traccar.component.html',
    styleUrls: ['./list-traccar.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule]
})
export class ListTraccarComponent implements OnInit {

  private readonly traccarService = inject(TraccarService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

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
        if (!traccarDto || traccarDto.length === 0) {
          this.traccarDtos = [];
          this.totalRecords = 0;
          this.toastr.warning('Aucun Traccar configuré pour cet utilisateur', 'Information');
        } else {
          this.traccarDtos = traccarDto;
          this.totalRecords = traccarDto?.length || 0;
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement des Traccars', 'Erreur');
        this.loading = false;
        console.error('Error loading traccars:', error);
      }
    });
  }

  searchWebAccount() {
    const keyword = this.searchForm.get('keyWord')?.value || '';
    this.getLisTraccar(keyword);
  }
}
