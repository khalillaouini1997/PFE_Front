import { Component, input, viewChild, AfterViewInit, OnDestroy, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css']
})
export class KpiCardComponent implements AfterViewInit, OnDestroy {
  label = input.required<string>();
  value = input.required<number | string>();
  icon = input('📊');
  trend = input<'up' | 'down' | null>(null);
  trendValue = input(0);
  showSparkline = input(false);

  sparkline = viewChild<ElementRef>('sparkline');
  private sparklineChart?: Chart;
  private sparklineData: number[] = [];

  constructor() {
    // Generate stable sparkline data once
    this.sparklineData = this.generateSparklineData();

    effect(() => {
      this.value();
      this.trend();
      // Only re-render if chart exists and showSparkline is true
      if (this.showSparkline() && this.sparklineChart) {
        this.updateSparklineData();
      }
    });
  }

  ngAfterViewInit() {
    if (this.showSparkline() && this.sparkline()) {
      this.renderSparkline();
    }
  }

  ngOnDestroy() {
    this.sparklineChart?.destroy();
  }

  private generateSparklineData(): number[] {
    const trend = this.trend() === 'up' ? 1 : -1;
    const baseValue = typeof this.value() === 'number' ? this.value() as number : 10;
    return Array.from({ length: 7 }, (_, i) => {
      const variation = Math.random() * 5;
      return Math.max(0, baseValue + (trend * variation * i / 7));
    });
  }

  private updateSparklineData() {
    if (!this.sparklineChart) return;

    const trend = this.trend() === 'up' ? 1 : -1;
    const baseValue = typeof this.value() === 'number' ? this.value() as number : 10;
    const newData = Array.from({ length: 7 }, (_, i) => {
      const variation = Math.random() * 5;
      return Math.max(0, baseValue + (trend * variation * i / 7));
    });

    this.sparklineChart.data.datasets[0].data = newData;
    this.sparklineChart.update('none'); // Use 'none' mode to prevent animation
  }

  private renderSparkline() {
    const canvas = this.sparkline()?.nativeElement;
    if (!canvas) return;

    const color = this.trend() === 'up' ? '#10b981' : this.trend() === 'down' ? '#f43f5e' : '#4f46e5';

    this.sparklineChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['', '', '', '', '', '', ''],
        datasets: [{
          data: this.sparklineData,
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }
}
