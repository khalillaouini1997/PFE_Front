import { Component, OnInit } from '@angular/core';
import { TraccarDto } from 'src/app/data/data';
import { TraccarService } from 'src/app/service/traccar.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-list-traccar',
    standalone: true,
    templateUrl: './list-traccar.component.html',
    styleUrls: ['./list-traccar.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule]
})
export class ListTraccarComponent implements OnInit {

  searchForm!: FormGroup;
  public maxSize: number = 5;
  public bigTotalItems: number = 175;
  public bigCurrentPage: number = 1;
  public numPages: number = 0;
  itemsPerPage = 30;
  traccarDtos: TraccarDto[] = [];
  loading: boolean = false;

  constructor(private traccarService: TraccarService, private fb: FormBuilder) { }

  ngOnInit() {
    this.initForms();
    this.getLisTraccar();
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });
  }

  getLisTraccar() {
    this.traccarService.getLisTraccar().subscribe((traccarDto: any) => {
      this.traccarDtos = traccarDto;
    });
  }

  searchWebAccount() {
    this.getLisTraccar();
  }
}
