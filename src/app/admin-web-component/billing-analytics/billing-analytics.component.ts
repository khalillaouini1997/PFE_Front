import { Component, OnInit, OnDestroy, inject, viewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';
import { BillingAnalyticsService } from 'src/app/service/billing-analytics.service';

Chart.register(...registerables);

@Component({
  selector: 'app-billing-analytics',
  standalone: true,
  templateUrl: './billing-analytics.component.html',
  styleUrls: ['./billing-analytics.component.css'],
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class BillingAnalyticsComponent implements OnInit, OnDestroy {
  selectedYear = new Date().getFullYear();
  loading = false;

  revenueByMonthChart = viewChild<ElementRef>('revenueByMonthChart');
  revenueByAccountChart = viewChild<ElementRef>('revenueByAccountChart');
  statusChart = viewChild<ElementRef>('statusChart');

  topDevices: any[] = [];

  private revenueByMonthInstance?: Chart;
  private revenueByAccountInstance?: Chart;
  private statusInstance?: Chart;

  private readonly analyticsService = inject(BillingAnalyticsService);

  ngOnInit() {
    this.loadAnalytics();
  }

  ngOnDestroy() {
    this.revenueByMonthInstance?.destroy();
    this.revenueByAccountInstance?.destroy();
    this.statusInstance?.destroy();
  }

  loadAnalytics() {
    this.loading = true;
    this.analyticsService.getBillingAnalytics(this.selectedYear).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.topDevices = data.topDevices || [];
        this.renderCharts(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(amount);
  }
}
