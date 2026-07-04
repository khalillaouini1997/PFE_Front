import { Component, OnInit, OnDestroy, inject, viewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, tap } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { BillingService } from 'src/app/service/billing.service';
import { BillingAnalyticsService } from 'src/app/service/billing-analytics.service';
import { WebAccountService } from 'src/app/service/web-account.service';

Chart.register(...registerables);

@Component({
  selector: 'app-billing',
  standalone: true,
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule]
})
export class BillingComponent implements OnInit, OnDestroy {
  activeTab: 'invoice' | 'dashboard' = 'dashboard';

  billingForm!: FormGroup;
  loading: boolean = false;
  billingResult: any = null;
  allInvoices: any[] = [];
  showAllInvoicesView: boolean = false;
  loadingAllInvoices: boolean = false;
  selectedAccountId: number | null = null;
  webAccounts: any[] = [];
  loadingAccounts: boolean = false;
  noExistingInvoice: boolean = false;

  selectedYear = new Date().getFullYear();
  analyticsLoading = false;
  topDevices: any[] = [];

  devicePage = 0;
  pageSize = 10;

  get totalDevicePages(): number {
    return Math.ceil((this.billingResult?.deviceBreakdown?.length || 0) / this.pageSize);
  }

  get pagedDevices(): any[] {
    const all = this.billingResult?.deviceBreakdown || [];
    return all.slice(this.devicePage * this.pageSize, (this.devicePage + 1) * this.pageSize);
  }

  revenueByMonthChart = viewChild<ElementRef>('revenueByMonthChart');
  revenueByAccountChart = viewChild<ElementRef>('revenueByAccountChart');
  statusChart = viewChild<ElementRef>('statusChart');
  revenueForecastChart = viewChild<ElementRef>('revenueForecastChart');

  private revenueByMonthInstance?: Chart;
  private revenueByAccountInstance?: Chart;
  private statusInstance?: Chart;
  private revenueForecastInstance?: Chart;

  private readonly billingService = inject(BillingService);
  private readonly analyticsService = inject(BillingAnalyticsService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.initForm();
    this.loadWebAccounts();
    setTimeout(() => {
      this.loadAnalytics();
      this.loadForecast();
    }, 0);
  }

  ngOnDestroy() {
    this.revenueByMonthInstance?.destroy();
    this.revenueByAccountInstance?.destroy();
    this.statusInstance?.destroy();
    this.revenueForecastInstance?.destroy();
  }

  switchTab(tab: 'invoice' | 'dashboard') {
    this.activeTab = tab;
    if (tab === 'dashboard') {
      setTimeout(() => {
        this.loadAnalytics();
        this.loadForecast();
      }, 0);
    }
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
      error: () => {
        this.loadingAccounts = false;
        this.billingForm.get('accountId')?.enable();
        this.toastr.error(
          this.translate.instant('BILLING.LOAD_ACCOUNTS_ERROR'),
          this.translate.instant('COMMON.ERROR')
        );
      }
    });
  }

  searchInvoice() {
    const accountId = this.billingForm.get('accountId')?.value;
    if (!accountId) {
      this.toastr.error(this.translate.instant('BILLING.SELECT_ACCOUNT'), this.translate.instant('COMMON.ERROR'));
      return;
    }
    this.billingResult = null;
    this.noExistingInvoice = false;
    this.devicePage = 0;
    this.checkExistingInvoice();
  }

  fetchAllInvoices() {
    const accountId = this.billingForm.get('accountId')?.value;
    if (!accountId) return;

    this.loadingAllInvoices = true;
    this.showAllInvoicesView = true;
    this.billingResult = null;
    this.noExistingInvoice = false;

    this.billingService.getAllInvoicesByAccount(accountId).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.allInvoices = Array.isArray(data) ? data : [];
        this.loadingAllInvoices = false;
      },
      error: () => {
        this.allInvoices = [];
        this.loadingAllInvoices = false;
      }
    });
  }

  backToSingleInvoice() {
    this.showAllInvoicesView = false;
    this.allInvoices = [];
  }

  viewInvoice(invoice: any) {
    this.showAllInvoicesView = false;
    this.allInvoices = [];
    this.billingResult = invoice;
    this.noExistingInvoice = false;
    this.billingForm.patchValue({
      year: parseInt(invoice.billingPeriod.split('-')[0]),
      month: parseInt(invoice.billingPeriod.split('-')[1])
    });
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
        if (data && data.billingPeriod) {
          this.billingResult = data;
          this.noExistingInvoice = false;
        } else {
          this.noExistingInvoice = true;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.noExistingInvoice = true;
        this.loading = false;
        this.cdr.detectChanges();
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
        error: () => {
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
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
        }
      });
  }

  downloadingPdf = false;

  downloadPdf() {
    const accountId = this.billingForm.get('accountId')?.value;
    const year = this.billingForm.get('year')?.value;
    const month = this.billingForm.get('month')?.value;

    if (!accountId) {
      this.toastr.error(this.translate.instant('BILLING.SELECT_ACCOUNT'), this.translate.instant('COMMON.ERROR'));
      return;
    }

    this.downloadingPdf = true;
    this.billingService.downloadPdfReport(accountId, year, month)
      .pipe(finalize(() => { this.downloadingPdf = false; }))
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
            this.toastr.success(this.translate.instant('BILLING.PDF_DOWNLOAD_SUCCESS'), this.translate.instant('COMMON.SUCCESS'));
          }
        },
        error: () => {
          this.toastr.success(this.translate.instant('BILLING.PDF_DOWNLOAD_SUCCESS'), this.translate.instant('COMMON.SUCCESS'));
        }
      });
  }

  togglePaymentStatus() {
    if (!this.billingResult) return;
    const newStatus = this.billingResult.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    const accountId = this.billingForm.get('accountId')?.value;
    const year = this.billingForm.get('year')?.value;
    const month = this.billingForm.get('month')?.value;

    this.billingService.updatePaymentStatus(accountId, year, month, newStatus).subscribe({
      next: () => {
        this.billingResult.paymentStatus = newStatus;
        this.toastr.success(`Invoice marked as ${newStatus}`, this.translate.instant('COMMON.SUCCESS'));
      },
      error: () => {
        this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
      }
    });
  }

  loadAnalytics() {
    this.analyticsLoading = true;
    this.analyticsService.getBillingAnalytics(this.selectedYear).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res?.body?.data ?? res;
        this.topDevices = Array.isArray(data?.topDevices) ? data.topDevices : [];
        this.analyticsLoading = false;
        this.cdr.detectChanges();
        try {
          this.renderCharts(data || {});
        } catch (e) {
          console.error('Chart rendering error:', e);
        }
      },
      error: () => {
        this.analyticsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadForecast() {
    this.analyticsService.getRevenueHistory().subscribe({
      next: (res: any) => {
        const history = res?.data ?? res;
        if (!Array.isArray(history) || history.length < 2) return;

        const monthlyRevenue = history.map((h: any) => h.total || 0);
        const labels = history.map((h: any) => h.billing_period);

        this.analyticsService.getRevenueForecast(monthlyRevenue, 6).subscribe({
          next: (forecast: any) => {
            this.renderForecastChart(labels, monthlyRevenue, forecast);
          },
          error: (e: any) => console.error('Forecast API error:', e)
        });
      },
      error: (e: any) => console.error('Revenue history error:', e)
    });
  }

  private renderForecastChart(actualLabels: string[], actualData: number[], forecast: any) {
    const canvas = this.revenueForecastChart();
    if (!canvas) return;

    const predictions: number[] = forecast?.predictions || [];
    const lastMonth = actualLabels[actualLabels.length - 1] || '';

    const predictedLabels = predictions.map((_: number, i: number) => {
      const [year, month] = lastMonth.split('-').map(Number);
      const d = new Date(year, month - 1 + i + 1, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const allLabels = [...actualLabels, ...predictedLabels];
    const actualValues = [...actualData, ...new Array(predictedLabels.length).fill(null)];
    const predictedValues = [
      ...new Array(actualLabels.length - 1).fill(null),
      actualData[actualData.length - 1],
      ...predictions
    ];

    if (this.revenueForecastInstance) {
      this.revenueForecastInstance.data.labels = allLabels;
      this.revenueForecastInstance.data.datasets[0].data = actualValues;
      this.revenueForecastInstance.data.datasets[1].data = predictedValues;
      this.revenueForecastInstance.update('none');
    } else {
      this.revenueForecastInstance = new Chart(canvas.nativeElement, {
        type: 'line',
        data: {
          labels: allLabels,
          datasets: [
            {
              label: 'Actual Revenue (TND)',
              data: actualValues,
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(20, 184, 166, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 3
            },
            {
              label: 'Predicted Revenue (TND)',
              data: predictedValues,
              borderColor: '#f59e0b',
              borderDash: [8, 4],
              fill: false,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 3,
              pointStyle: 'triangle'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false }, ticks: { maxRotation: 45 } }
          }
        }
      });
    }
  }

  private renderCharts(data: any) {
    this.renderRevenueByMonth(data.revenueByMonth || []);
    this.renderRevenueByAccount(data.revenueByAccount || []);
    this.renderStatusBreakdown(data.statusBreakdown || []);
  }

  private renderRevenueByMonth(data: any[]) {
    const canvas = this.revenueByMonthChart();
    if (!canvas) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = new Map(data.map((d: any) => [d.month_num, d.total]));
    const values = months.map((_, i) => map.get(String(i + 1).padStart(2, '0')) || 0);

    if (this.revenueByMonthInstance) {
      this.revenueByMonthInstance.data.labels = months;
      this.revenueByMonthInstance.data.datasets[0].data = values;
      this.revenueByMonthInstance.update('none');
    } else {
      this.revenueByMonthInstance = new Chart(canvas.nativeElement, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Revenue (TND)',
            data: values,
            borderColor: '#14b8a6',
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
        }
      });
    }
  }

  private renderRevenueByAccount(data: any[]) {
    const canvas = this.revenueByAccountChart();
    if (!canvas) return;

    const labels = data.map((d: any) => d.accountName || `#${d.accountId}`);
    const values = data.map((d: any) => d.total);

    if (this.revenueByAccountInstance) {
      this.revenueByAccountInstance.data.labels = labels;
      this.revenueByAccountInstance.data.datasets[0].data = values;
      this.revenueByAccountInstance.update('none');
    } else {
      this.revenueByAccountInstance = new Chart(canvas.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Revenue (TND)',
            data: values,
            backgroundColor: '#14b8a6',
            borderRadius: 8
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, grid: { display: false } }, y: { grid: { display: false } } }
        }
      });
    }
  }

  private renderStatusBreakdown(data: any[]) {
    const canvas = this.statusChart();
    if (!canvas) return;

    const labels = data.map((d: any) => d.status);
    const values = data.map((d: any) => d.count);
    const colors = ['#f59e0b', '#10b981', '#ef4444'];

    if (this.statusInstance) {
      this.statusInstance.data.labels = labels;
      this.statusInstance.data.datasets[0].data = values;
      this.statusInstance.update('none');
    } else {
      this.statusInstance = new Chart(canvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: colors, hoverOffset: 4 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3
    }).format(amount);
  }
}
