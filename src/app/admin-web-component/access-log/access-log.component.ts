import { Component, OnInit, inject } from '@angular/core';
import { AccessLog } from 'src/app/data/data';
import { AccessLogService } from 'src/app/service/access-log.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AdminAccountService } from 'src/app/service/admin-account.service'; // Assuming this service exists
import { AuthService } from 'src/app/service/auth.service'; // Assuming this service exists
import { Router } from '@angular/router'; // Assuming this is needed for router

@Component({
  selector: 'app-access-log',
  templateUrl: './access-log.component.html',
  styleUrls: ['./access-log.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, PaginationModule, DatePipe]
})
export class AccessLogComponent implements OnInit {

  loading: boolean = false;
  accessLogs: AccessLog[] = [];
  public maxSize: number = 5;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  public numPages: number = 0;
  itemsPerPage = 10;
  searchForm!: FormGroup;

  private readonly accessLogService = inject(AccessLogService);
  private readonly adminAccountService = inject(AdminAccountService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  ngOnInit() {
    this.initForms();
    // Assuming authService and router are correctly imported and used
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    } else {
      this.getAllAccessLogs(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });
  }

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllAccessLogs(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
  }

  getAllAccessLogs(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.accessLogs = [];
    this.accessLogService.getAllAccessLog(keyWord, page, size).subscribe({
      next: (_accessLogs) => {
        this.loading = false;
        this.accessLogs = _accessLogs.content as AccessLog[]; // Fixed type casting
        this.bigTotalItems = _accessLogs.totalElements;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  searchAccess() { // Renamed from searchWebAccount to match original intent
    this.bigCurrentPage = 1;
    this.getAllAccessLogs(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
  }
}
