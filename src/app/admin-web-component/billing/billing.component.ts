import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, tap } from 'rxjs';
import { BillingService } from 'src/app/service/billing.service';
import { WebAccountService } from 'src/app/service/web-account.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule]
})
export class BillingComponent implements OnInit {
  billingForm!: FormGroup;
  loading: boolean = false;
  billingResult: any = null;
  selectedAccountId: number | null = null;
  webAccounts: any[] = [];
  loadingAccounts: boolean = false;
  noExistingInvoice: boolean = false;

  private readonly billingService = inject(BillingService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly METABASE_URL = 'http://localhost:3000/embed/dashboard/YOUR_TOKEN_HERE';
  metabaseUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.METABASE_URL);

  ngOnInit() {
    this.initForm();
    this.loadWebAccounts();
  }

  initForm() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    this.billingForm = this.fb.group({
      accountId: [''],
      year: [lastMonth.getFullYear()],
      month: [lastMonth.getMonth() + 1]
    });
  }

  loadWebAccounts() {
    this.loadingAccounts = true;
    this.billingForm.get('accountId')?.disable();
    this.webAccountService.getAllWebAccountNames().subscribe({
      next: (res: any) => {
        const responseData = res?.data || res;
        this.webAccounts = Array.isArray(responseData) ? responseData : [];
        this.loadingAccounts = false;
        this.billingForm.get('accountId')?.enable();
      },
      error: (err) => {
        this.loadingAccounts = false;
        this.billingForm.get('accountId')?.enable();
        this.toastr.error(
          this.translate.instant('BILLING.LOAD_ACCOUNTS_ERROR'),
          this.translate.instant('COMMON.ERROR')
        );
      }
    });
  }

  onAccountChange() {
    const accountId = this.billingForm.get('accountId')?.value;
    if (!accountId) {
      this.billingResult = null;
      this.noExistingInvoice = false;
      return;
    }

    this.checkExistingInvoice();
  }

  checkExistingInvoice() {
    const accountId = this.billingForm.get('accountId')?.value;
    const year = this.billingForm.get('year')?.value;
    const month = this.billingForm.get('month')?.value;

    if (!accountId) return;

    this.loading = true;
    this.billingResult = null;
    this.noExistingInvoice = false;

    this.billingService.checkExistingInvoice(accountId, year, month).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        if (data && data.totalAmount > 0) {
          this.billingResult = data;
          this.noExistingInvoice = false;
        } else {
          this.noExistingInvoice = true;
        }
        this.loading = false;
      },
      error: (err) => {
        this.noExistingInvoice = true;
        this.loading = false;
      }
    });
  }

  calculateBilling() {
    if (this.billingForm.invalid) {
      this.toastr.error(this.translate.instant('BILLING.INVALID_FORM'), this.translate.instant('COMMON.ERROR'));
      return;
    }

    const accountId = this.billingForm.get('accountId')?.value;
    const year = this.billingForm.get('year')?.value;
    const month = this.billingForm.get('month')?.value;

    if (!accountId) {
      this.toastr.error(this.translate.instant('BILLING.SELECT_ACCOUNT'), this.translate.instant('COMMON.ERROR'));
      return;
    }

    this.loading = true;
    this.noExistingInvoice = false;
    this.billingService.calculateMonthlyBilling(accountId, year, month)
      .pipe(
        tap(() => this.toastr.success(this.translate.instant('BILLING.CALCULATION_SUCCESS'), this.translate.instant('COMMON.SUCCESS'))),
        finalize(() => { this.loading = false; })
      )
      .subscribe({
        next: (res: any) => {
          this.billingResult = res?.data || res;
        },
        error: (err) => {
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
        }
      });
  }

  refreshBilling() {
    const accountId = this.billingForm.get('accountId')?.value;
    const year = this.billingForm.get('year')?.value;
    const month = this.billingForm.get('month')?.value;

    if (!accountId) {
      this.toastr.error(this.translate.instant('BILLING.SELECT_ACCOUNT'), this.translate.instant('COMMON.ERROR'));
      return;
    }

    this.loading = true;
    this.billingService.refreshMonthlyBilling(accountId, year, month)
      .pipe(
        tap(() => this.toastr.success(this.translate.instant('BILLING.REFRESH_SUCCESS'), this.translate.instant('COMMON.SUCCESS'))),
        finalize(() => { this.loading = false; })
      )
      .subscribe({
        next: (res: any) => {
          this.billingResult = res?.data || res;
          this.noExistingInvoice = false;
        },
        error: (err) => {
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
        }
      });
  }

  downloadPdf() {
    const accountId = this.billingForm.get('accountId')?.value;
    const year = this.billingForm.get('year')?.value;
    const month = this.billingForm.get('month')?.value;

    if (!accountId) {
      this.toastr.error(this.translate.instant('BILLING.SELECT_ACCOUNT'), this.translate.instant('COMMON.ERROR'));
      return;
    }

    this.loading = true;
    this.billingService.downloadPdfReport(accountId, year, month)
      .pipe(
        finalize(() => { this.loading = false; })
      )
      .subscribe({
        next: (blob: Blob) => {
          if (blob && blob.size > 0 && blob.type !== 'application/json') {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `billing_report_${accountId}_${year}-${month}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.toastr.success(this.translate.instant('BILLING.PDF_DOWNLOAD_SUCCESS'), this.translate.instant('COMMON.SUCCESS'));
          } else {
            this.toastr.error('Failed to generate PDF', this.translate.instant('COMMON.ERROR'));
          }
        },
        error: (err) => {
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
        }
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3
    }).format(amount);
  }
}
