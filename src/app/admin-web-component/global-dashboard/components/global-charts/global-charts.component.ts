import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  viewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {GlobalDashboardStats} from '../../../../shared/stores';
import {CHART_CONSTANTS, SIM_CARD_PREFIXES, SPEED_BANDS} from '../../../../shared/constants/app.constants';
import {Chart, registerables} from 'chart.js';
import {updateOrCreateChart} from '../../../../shared/utils/chart.utils';

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
  healthScore = computed(() => {
    const s = this.stats();
    const total = s.totalVehicles || (s.valid + s.technicalIssue + s.nonValid);
    return total > 0 ? Math.round((s.valid / total) * 100) : 0;
  });
  private stateChart?: Chart;
  private speedChartInstance?: Chart;
  private puceChartInstance?: Chart;
  private signalChartInstance?: Chart;
  private healthChartInstance?: Chart;
  private readonly translate = inject(TranslateService);

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

    this.stateChart = updateOrCreateChart(
      this.statusChart(), this.stateChart,
      {
        type: 'doughnut',
        data,
        options: {plugins: {legend: {position: 'bottom'}}}
      }
    );
  }

  private updateSpeedChart() {
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

    this.speedChartInstance = updateOrCreateChart(
      this.speedChart(), this.speedChartInstance,
      {
        type: 'bar',
        data,
        options: {
          plugins: {legend: {display: false}},
          scales: {y: {beginAtZero: true, grid: {display: false}}, x: {grid: {display: false}}}
        }
      }
    );
  }

  private updatePuceChart() {
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

    this.puceChartInstance = updateOrCreateChart(
      this.puceChart(), this.puceChartInstance,
      {
        type: 'pie',
        data,
        options: {plugins: {legend: {position: 'bottom'}}}
      }
    );
  }

  private updateSignalChart() {
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

    this.signalChartInstance = updateOrCreateChart(
      this.signalChart(), this.signalChartInstance,
      {
        type: 'bar',
        data,
        options: {
          plugins: {legend: {display: false}},
          scales: {y: {beginAtZero: true, grid: {display: false}}, x: {grid: {display: false}}}
        }
      }
    );
  }

  private updateHealthChart() {
    const score = this.healthScore();
    let color = '#10b981';
    if (score < 50) {
      color = '#ef4444';
    } else if (score < 80) {
      color = '#f59e0b';
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

    this.healthChartInstance = updateOrCreateChart(
      this.healthChart(), this.healthChartInstance,
      {
        type: 'doughnut',
        data,
        options: {plugins: {legend: {display: false}, tooltip: {enabled: false}}, cutout: '75%'}
      }
    );
  }
}
