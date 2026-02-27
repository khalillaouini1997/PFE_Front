import { Component, OnInit } from '@angular/core';
import { TraccarDto } from 'src/app/data/data';
import { TraccarService } from 'src/app/service/traccar.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-list-traccar',
    templateUrl: './list-traccar.component.html',
    styleUrls: ['./list-traccar.component.css'],
    standalone: true,
    imports: [FormsModule, NgIf, NgFor]
})
export class ListTraccarComponent implements OnInit {

  keyWord: string = "";
  public maxSize: number = 5;
  public bigTotalItems: number = 175;
  public bigCurrentPage: number = 1;
  public numPages: number = 0;
  itemsPerPage = 30;
  traccarDtos: TraccarDto[] = [];
  loading: boolean = false;
  
  constructor(private traccarService: TraccarService) {
 
  }

  ngOnInit() {
    this.getLisTraccar();
  }



  getLisTraccar() {
    this.traccarService.getLisTraccar().subscribe((traccarDto:any) => {
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
