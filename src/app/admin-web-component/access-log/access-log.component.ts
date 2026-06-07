import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AccessLog } from 'src/app/data/data';
import { AccessLogService } from 'src/app/service/access-log.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminAccountService } from 'src/app/service/admin-account.service';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-access-log',
    standalone: true,
    templateUrl: './access-log.component.html',
    styleUrls: ['./access-log.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, DatePipe, TranslateModule]
})
export class AccessLogComponent implements OnInit {

  loading: boolean = false;
  accessLogs: AccessLog[] = [];
  public maxSize: number = 5;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  itemsPerPage = 10;
  searchForm!: FormGroup;

  private readonly accessLogService = inject(AccessLogService);
  private readonly adminAccountService = inject(AdminAccountService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.initForms();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    }
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });
  }

  public pageChanged(event: any): void {
    if (event.first !== undefined && event.rows !== undefined) {
      this.bigCurrentPage = (event.first / event.rows) + 1;
      this.itemsPerPage = event.rows;
      this.getAllAccessLogs(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }

  getAllAccessLogs(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.accessLogs = [];
    this.accessLogService.getAllAccessLog(keyWord, page, size).subscribe({
      next: (_accessLogs: any) => {
        const responseData = _accessLogs?.data || _accessLogs;
        const content = responseData?.content || responseData || [];
        this.accessLogs = Array.isArray(content) ? content : [];
        this.bigTotalItems = responseData?.totalElements || responseData?.page?.totalElements || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  searchAccess() {
    this.bigCurrentPage = 1;
    this.getAllAccessLogs(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
  }
}
