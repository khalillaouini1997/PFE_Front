import { Component, OnInit } from '@angular/core';
import { TraccarDto } from 'src/app/data/data';
import { TraccarService } from 'src/app/service/traccar.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-list-traccar',
  templateUrl: './list-traccar.component.html',
  styleUrls: ['./list-traccar.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule]
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

  constructor(private traccarService: TraccarService, private fb: FormBuilder) {

  }

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

  //=====================================
  //    Search server account 
  //=====================================

  searchWebAccount() {
    this.getLisTraccar();
  }
}
