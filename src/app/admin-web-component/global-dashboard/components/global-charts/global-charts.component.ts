import { Component, input, viewChild, inject, AfterViewInit, OnDestroy, ElementRef, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalDashboardStats, GlobalRealTime } from '../../../../shared/stores/global-dashboard.store';
import { CHART_CONSTANTS, SPEED_BANDS, SIM_CARD_PREFIXES, STATUS_TYPES } from '../../../../shared/constants/app.constants';
import { TranslateService } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-global-charts',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './global-charts.component.html',
  styleUrls: ['./global-charts.component.css']
})
export class GlobalChartsComponent implements AfterViewInit, OnDestroy {
  realtimes = input<any[]>([]);
  stats = input<GlobalDashboardStats>({
    totalVehicles: 0,
    valid: 0,
    technicalIssue: 0,
    nonValid: 0,
    moving: 0,
    stopped: 0,
    ignitionOn: 0,
    accountsCount: 0,
    inactive: 0
  });

  statusChart = viewChild<ElementRef>('statusChart');
  speedChart = viewChild<ElementRef>('speedChart');
  puceChart = viewChild<ElementRef>('puceChart');
  signalChart = viewChild<ElementRef>('signalChart');
  healthChart = viewChild<ElementRef>('healthChart');

  private stateChart?: Chart;
  private speedChartInstance?: Chart;
  private puceChartInstance?: Chart;
  private signalChartInstance?: Chart;
  private healthChartInstance?: Chart;

  private translate = inject(TranslateService);

  healthScore = computed(() => {
    const s = this.stats();
    const total = s.totalVehicles || (s.valid + s.technicalIssue + s.nonValid);
    return total > 0 ? Math.round((s.valid / total) * 100) : 0;
  });

  constructor() {
    effect(() => {
      this.realtimes();
      this.stats();
      this.updateCharts();
    });
  }

  ngAfterViewInit() {
    this.updateCharts();
  }

  ngOnDestroy() {
    this.stateChart?.destroy();
    this.speedChartInstance?.destroy();
    this.puceChartInstance?.destroy();
    this.signalChartInstance?.destroy();
    this.healthChartInstance?.destroy();
  }

  updateCharts() {
    if (!this.statusChart() || !this.speedChart() || !this.puceChart() || !this.signalChart() || !this.healthChart()) return;
    this.updateStateChart();
    this.updateSpeedChart();
    this.updatePuceChart();
    this.updateSignalChart();
    this.updateHealthChart();
  }

  private updateStateChart() {
    const canvas = this.statusChart();
    if (!canvas) return;

    const stats = this.stats();
    const data = {
      labels: [
        this.translate.instant('DASHBOARD.STATE_VALID'),
        this.translate.instant('DASHBOARD.STATE_ISSUE'),
        this.translate.instant('DASHBOARD.STATE_NON_VALID')
      ],
      datasets: [{
        data: [stats.valid, stats.technicalIssue, stats.nonValid],
        backgroundColor: [CHART_CONSTANTS.COLORS.VALID, CHART_CONSTANTS.COLORS.ISSUE, CHART_CONSTANTS.COLORS.NON_VALID],
        hoverOffset: 4
      }]
    };

    if (this.stateChart) {
      this.stateChart.data = data;
      this.stateChart.update('none');
    } else {
      this.stateChart = new Chart(canvas.nativeElement, {
        type: 'doughnut',
        data,
        options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { position: 'bottom' } } }
      });
    }
  }

  private updateSpeedChart() {
    const canvas = this.speedChart();
    if (!canvas) return;

    const r = this.realtimes();
    const bands = {
      [SPEED_BANDS.STOPPED]: r.filter(t => t.speed === 0).length,
      [SPEED_BANDS.SLOW]: r.filter(t => t.speed > 0 && t.speed <= 30).length,
      [SPEED_BANDS.MEDIUM]: r.filter(t => t.speed > 30 && t.speed <= 60).length,
      [SPEED_BANDS.FAST]: r.filter(t => t.speed > 60).length
    };

    const data = {
      labels: Object.keys(bands),
      datasets: [{
        label: this.translate.instant('DASHBOARD.VEHICLES'),
        data: Object.values(bands),
        backgroundColor: CHART_CONSTANTS.COLORS.PRIMARY,
        borderRadius: CHART_CONSTANTS.BORDER_RADIUS
      }]
    };

    if (this.speedChartInstance) {
      this.speedChartInstance.data = data;
      this.speedChartInstance.update('none');
    } else {
      this.speedChartInstance = new Chart(canvas.nativeElement, {
        type: 'bar',
        data,
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
        }
      });
    }
  }

  private updatePuceChart() {
    const canvas = this.puceChart();
    if (!canvas) return;

    const r = this.realtimes();
    const counts = {
      'Orange Tunisie': r.filter(t => t.numPuce?.startsWith(SIM_CARD_PREFIXES.ORANGE_TUNISIE)).length,
      'Tunisie Telecom': r.filter(t => t.numPuce?.startsWith(SIM_CARD_PREFIXES.TUNISIE_TELECOM)).length,
      'Ooredoo Tunisie': r.filter(t => t.numPuce?.startsWith(SIM_CARD_PREFIXES.OOREDOO_TUNISIE)).length,
      'Unknown': r.filter(t => !t.numPuce?.startsWith('892160')).length
    };

    const data = {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: [
          CHART_CONSTANTS.COLORS.ORANGE_TUNISIE,
          CHART_CONSTANTS.COLORS.TUNISIE_TELECOM,
          CHART_CONSTANTS.COLORS.OOREDOO,
          CHART_CONSTANTS.COLORS.UNKNOWN
        ],
        hoverOffset: 4
      }]
    };

    if (this.puceChartInstance) {
      this.puceChartInstance.data = data;
      this.puceChartInstance.update('none');
    } else {
      this.puceChartInstance = new Chart(canvas.nativeElement, {
        type: 'pie',
        data,
        options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { position: 'bottom' } } }
      });
    }
  }

  private updateSignalChart() {
    const canvas = this.signalChart();
    if (!canvas) return;

    const r = this.realtimes() as any[];
    const signalDistribution = {
      'Excellent': r.filter(t => t.signal >= 20).length,
      'Good': r.filter(t => t.signal >= 15 && t.signal < 20).length,
      'Fair': r.filter(t => t.signal >= 10 && t.signal < 15).length,
      'Poor': r.filter(t => t.signal < 10).length
    };

    const data = {
      labels: Object.keys(signalDistribution),
      datasets: [{
        label: 'Vehicles',
        data: Object.values(signalDistribution),
        backgroundColor: [CHART_CONSTANTS.COLORS.VALID, '#10b981', '#f59e0b', CHART_CONSTANTS.COLORS.ISSUE],
        borderRadius: CHART_CONSTANTS.BORDER_RADIUS
      }]
    };

    if (this.signalChartInstance) {
      this.signalChartInstance.data = data;
      this.signalChartInstance.update('none');
    } else {
      this.signalChartInstance = new Chart(canvas.nativeElement, {
        type: 'bar',
        data,
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
        }
      });
    }
  }

  private updateHealthChart() {
    const canvas = this.healthChart();
    if (!canvas) return;

    const score = this.healthScore();
    let color = '#10b981'; // Good (Green)
    if (score < 50) {
      color = '#ef4444'; // Poor (Red)
    } else if (score < 80) {
      color = '#f59e0b'; // Fair (Amber)
    }

    const data = {
      labels: ['Health', 'Remaining'],
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [color, 'var(--surface-border, #1e2d45)'],
        borderWidth: 0,
        hoverOffset: 0
      }]
    };

    if (this.healthChartInstance) {
      this.healthChartInstance.data = data;
      this.healthChartInstance.update('none');
    } else {
      this.healthChartInstance = new Chart(canvas.nativeElement, {
        type: 'doughnut',
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          cutout: '75%'
        }
      });
    }
  }
}
