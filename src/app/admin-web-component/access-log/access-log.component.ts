import { Component, OnInit, inject } from '@angular/core';
import { AccessLog } from 'src/app/data/data';
import { AccessLogService } from 'src/app/service/access-log.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-access-log',
  templateUrl: './access-log.component.html',
  styleUrls: ['./access-log.component.css'],
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, PaginationModule, DatePipe]
})
export class AccessLogComponent implements OnInit {

  loading: boolean = false;
  accessLog: AccessLog[] = [];
  keyWord: string = "";
  public maxSize: number = 5;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  public numPages: number = 0;
  itemsPerPage = 30;

  private readonly accessLogService = inject(AccessLogService);

  ngOnInit() {
    this.getAllAccessLog(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllAccessLog(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  getAllAccessLog(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.accessLog = [];
    this.accessLogService.getAllAccessLog(keyWord, page, size).subscribe({
      next: (_accessLog) => {
        this.accessLog = _accessLog.content;
        this.bigTotalItems = _accessLog.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  searchAccess() {
    this.bigCurrentPage = 1;
    this.getAllAccessLog(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }
}
