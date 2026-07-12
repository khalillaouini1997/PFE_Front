import {ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {finalize, tap} from 'rxjs';
import {Chart, registerables} from 'chart.js';
import {updateOrCreateChart} from 'src/app/shared/utils/chart.utils';
import {BillingService} from 'src/app/service/billing.service';
import {BillingAnalyticsService} from 'src/app/service/billing-analytics.service';
import {WebAccountService} from 'src/app/service/web-account.service';
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';

Chart.register(...registerables);

@Component({
  selector: 'app-billing',
  standalone: true,
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, TableModule, PaginatorModule]
})
export class BillingComponent implements OnInit, OnDestroy {
  activeTab: 'invoice' | 'dashboard' = 'dashboard';

  billingForm!: FormGroup;
  loading: boolean = false;
  billingResult: any = null;
  allInvoices: any[] = [];
  showAllInvoicesView: boolean = false;
  loadingAllInvoices: boolean = false;
  showCalcModal: boolean = false;
  calcStartYear: number = new Date().getFullYear();
  calcStartMonth: number = new Date().getMonth() + 1;
  selectedAccountId: number | null = null;
  webAccounts: any[] = [];
  loadingAccounts: boolean = false;
  noExistingInvoice: boolean = false;

  selectedYear = new Date().getFullYear();
  analyticsLoading = false;
  topDevices: any[] = [];

  revenueByMonthChart = viewChild<ElementRef>('revenueByMonthChart');
  revenueByAccountChart = viewChild<ElementRef>('revenueByAccountChart');
  statusChart = viewChild<ElementRef>('statusChart');
  revenueForecastChart = viewChild<ElementRef>('revenueForecastChart');
  downloadingPdf = false;
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.allInvoices = [];
        this.loadingAllInvoices = false;
        this.cdr.detectChanges();
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
      year: Number.parseInt(invoice.billingPeriod.split('-')[0]),
      month: Number.parseInt(invoice.billingPeriod.split('-')[1])
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
        if (data?.billingPeriod) {
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
    const accountId = this.billingForm.get('accountId')?.value;
    const year = this.calcStartYear;
    const month = this.calcStartMonth;

    if (!accountId) {
      this.toastr.error(this.translate.instant('BILLING.SELECT_ACCOUNT'), this.translate.instant('COMMON.ERROR'));
      return;
    }

    this.loading = true;
    this.noExistingInvoice = false;
    this.billingService.generateBatchBilling(accountId, year, month)
      .pipe(
        tap(() => this.toastr.success(this.translate.instant('BILLING.BATCH_SUCCESS'), this.translate.instant('COMMON.SUCCESS'))),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          const data = res?.data || res;
          this.allInvoices = Array.isArray(data) ? data : [];
          this.billingResult = this.allInvoices.length > 0 ? this.allInvoices.at(-1) : null;
          this.showAllInvoicesView = this.allInvoices.length > 0;
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
        }
      });
  }

  calculateAllAccounts() {
    this.loading = true;
    this.billingService.triggerAllAccountsBilling()
      .pipe(
        tap(() => this.toastr.success(this.translate.instant('BILLING.ALL_ACCOUNTS_SUCCESS'), this.translate.instant('COMMON.SUCCESS'))),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.showAllInvoicesView = false;
          this.allInvoices = [];
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
        }
      });
  }

  calculateSpecificAccount() {
    const accountId = this.billingForm.get('accountId')?.value;
    if (!accountId) {
      this.toastr.error(this.translate.instant('BILLING.SELECT_ACCOUNT'), this.translate.instant('COMMON.ERROR'));
      return;
    }

    this.loading = true;
    this.billingService.triggerAccountBilling(accountId)
      .pipe(
        tap(() => this.toastr.success(this.translate.instant('BILLING.ACCOUNT_SUCCESS'), this.translate.instant('COMMON.SUCCESS'))),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.billingResult = res?.data || res;
          this.showAllInvoicesView = false;
          this.allInvoices = [];
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
        finalize(() => {
          this.loading = false;
        })
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
      .pipe(finalize(() => {
        this.downloadingPdf = false;
      }))
      .subscribe({
        next: (blob: Blob) => {
          if (blob && blob.size > 0 && blob.type !== 'application/json') {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `billing_report_${accountId}_${year}-${month}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
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
        const labels = history.map((h: any) => h.billingPeriod);

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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3
    }).format(amount);
  }

  private renderForecastChart(actualLabels: string[], actualData: number[], forecast: any) {
    const predictions: number[] = forecast?.predictions || [];
    const confidenceLower: number[] = forecast?.confidence_lower || [];
    const confidenceUpper: number[] = forecast?.confidence_upper || [];
    const lastMonth = actualLabels.at(-1) ?? '';

    const predictedLabels = predictions.map((_: number, i: number) => {
      const [year, month] = lastMonth.split('-').map(Number);
      const d = new Date(year, month - 1 + i + 1, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const allLabels = [...actualLabels, ...predictedLabels];
    const actualValues = [...actualData, ...new Array(predictedLabels.length).fill(null)];
    const predictedValues = [
      ...new Array(actualLabels.length - 1).fill(null),
      actualData.at(-1),
      ...predictions
    ];
    const lowerBand = [
      ...new Array(actualLabels.length - 1).fill(null),
      actualData.at(-1),
      ...confidenceLower
    ];
    const upperBand = [
      ...new Array(actualLabels.length - 1).fill(null),
      actualData.at(-1),
      ...confidenceUpper
    ];

    this.revenueForecastInstance = updateOrCreateChart(
      this.revenueForecastChart(), this.revenueForecastInstance,
      {
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
            },
            {
              label: 'Upper Confidence (95%)',
              data: upperBand,
              borderColor: 'rgba(245, 158, 11, 0.3)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              fill: '+1',
              tension: 0.4,
              borderWidth: 1,
              pointRadius: 0,
              borderDash: [4, 2]
            },
            {
              label: 'Lower Confidence (95%)',
              data: lowerBand,
              borderColor: 'rgba(245, 158, 11, 0.3)',
              backgroundColor: 'transparent',
              fill: false,
              tension: 0.4,
              borderWidth: 1,
              pointRadius: 0,
              borderDash: [4, 2]
            }
          ]
        },
        options: {
          plugins: {
            legend: {position: 'top'},
            tooltip: {mode: 'index', intersect: false}
          },
          scales: {
            y: {beginAtZero: true, grid: {display: false}},
            x: {grid: {display: false}, ticks: {maxRotation: 45}}
          }
        }
      }
    );
  }

  private renderCharts(data: any) {
    this.renderRevenueByMonth(data.revenueByMonth || []);
    this.renderRevenueByAccount(data.revenueByAccount || []);
    this.renderStatusBreakdown(data.statusBreakdown || []);
  }

  private renderRevenueByMonth(data: any[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = new Map(data.map((d: any) => [d.monthNum, d.total]));
    const values = months.map((_, i) => map.get(String(i + 1).padStart(2, '0')) || 0);

    this.revenueByMonthInstance = updateOrCreateChart(
      this.revenueByMonthChart(), this.revenueByMonthInstance,
      {
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
          plugins: {legend: {display: false}},
          scales: {y: {beginAtZero: true, grid: {display: false}}, x: {grid: {display: false}}}
        }
      }
    );
  }

  private renderRevenueByAccount(data: any[]) {
    const labels = data.map((d: any) => d.accountName || `#${d.accountId}`);
    const values = data.map((d: any) => d.total);

    this.revenueByAccountInstance = updateOrCreateChart(
      this.revenueByAccountChart(), this.revenueByAccountInstance,
      {
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
          plugins: {legend: {display: false}},
          scales: {x: {beginAtZero: true, grid: {display: false}}, y: {grid: {display: false}}}
        }
      }
    );
  }

  private renderStatusBreakdown(data: any[]) {
    const labels = data.map((d: any) => d.status);
    const values = data.map((d: any) => d.count);
    const colors = ['#f59e0b', '#10b981', '#ef4444'];

    this.statusInstance = updateOrCreateChart(
      this.statusChart(), this.statusInstance,
      {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{data: values, backgroundColor: colors, hoverOffset: 4}]
        },
        options: {plugins: {legend: {position: 'bottom'}}}
      }
    );
  }
}
