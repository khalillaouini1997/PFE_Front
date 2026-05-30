import { Component, input, viewChild, inject, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealTime } from '../../../../data/data';
import { CHART_CONSTANTS, SPEED_BANDS, SIM_CARD_PREFIXES, STATUS_TYPES } from '../../../../shared/constants/app.constants';
import { TranslateService } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.css']
})
export class DashboardChartsComponent implements AfterViewInit, OnDestroy {
  realtimes = input<RealTime[]>([]);
  stats = input<{ total: number; valid: number; technicalIssue: number; moving: number }>({
    total: 0,
    valid: 0,
    technicalIssue: 0,
    moving: 0
  });

  statusChart = viewChild<ElementRef>('statusChart');
  speedChart = viewChild<ElementRef>('speedChart');
  puceChart = viewChild<ElementRef>('puceChart');

  private stateChart?: Chart;
  private speedChartInstance?: Chart;
  private puceChartInstance?: Chart;
  private translate = inject(TranslateService);

  ngAfterViewInit() {
    this.updateCharts();
  }

  ngOnDestroy() {
    this.stateChart?.destroy();
    this.speedChartInstance?.destroy();
    this.puceChartInstance?.destroy();
  }

  updateCharts() {
    this.updateStateChart();
    this.updateSpeedChart();
    this.updatePuceChart();
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
        data: [
          stats.valid,
          stats.technicalIssue,
          this.realtimes().filter(t => t.status === STATUS_TYPES.NON_VALID).length
        ],
        backgroundColor: [
          CHART_CONSTANTS.COLORS.VALID,
          CHART_CONSTANTS.COLORS.ISSUE,
          CHART_CONSTANTS.COLORS.NON_VALID
        ],
        hoverOffset: 4
      }]
    };

    if (this.stateChart) {
      this.stateChart.data = data;
      this.stateChart.update();
    } else {
      this.stateChart = new Chart(canvas.nativeElement, {
        type: 'doughnut',
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
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
      this.speedChartInstance.update();
    } else {
      this.speedChartInstance = new Chart(canvas.nativeElement, {
        type: 'bar',
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
          }
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
      'Unknown': r.filter(t => {
        const p = t.numPuce || '';
        return !p.startsWith('892160');
      }).length
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
      this.puceChartInstance.update();
    } else {
      this.puceChartInstance = new Chart(canvas.nativeElement, {
        type: 'pie',
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }
}
