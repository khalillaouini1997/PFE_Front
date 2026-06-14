import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { withToast } from '../../utils/toast.helpers';
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

  private readonly billingService = inject(BillingService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);

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
    withToast(this.billingService.calculateMonthlyBilling(accountId, year, month), this.toastr, this.translate, 'BILLING.CALCULATION_SUCCESS')
      .subscribe({
        next: (res: any) => {
          this.billingResult = res?.data || res;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
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
    withToast(this.billingService.refreshMonthlyBilling(accountId, year, month), this.toastr, this.translate, 'BILLING.REFRESH_SUCCESS')
      .subscribe({
        next: (res: any) => {
          this.billingResult = res?.data || res;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
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
    withToast(this.billingService.downloadPdfReport(accountId, year, month), this.toastr, this.translate, 'BILLING.PDF_DOWNLOAD_SUCCESS')
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `billing_report_${accountId}_${year}-${month}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
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
