import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccessLog } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-access-log',
  templateUrl: './access-log.component.html',
  styleUrls: ['./access-log.component.css']
})
export class AccessLogComponent implements OnInit {

  loading: boolean;
  accessLog: AccessLog[];
  keyWord: string = "";
  public maxSize: number = 5;
  public bigTotalItems: number = 175;
  public bigCurrentPage: number = 1;
  public numPages: number = 0;
  itemsPerPage = 30;
  constructor(private service: DataService, private router: Router) { }

  ngOnInit() {
    this.getAllAccessLog(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

    //=====================================
  //    Change page
  //=====================================

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllAccessLog(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }
  //=====================================
  //     Get All accessLog
  //     by keyword or not
  //=====================================

  getAllAccessLog(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.accessLog = [];
    this.service.getAllAccessLog(keyWord, page, size).subscribe(_accessLog => {
        this.accessLog = _accessLog.content;
        this.bigTotalItems = _accessLog.totalElements;
        this.loading = false;
      });

  }

    //=====================================
  //    Search access log
  //=====================================

  searchAccess() {
    this.bigCurrentPage = 1;
    this.getAllAccessLog(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

}
