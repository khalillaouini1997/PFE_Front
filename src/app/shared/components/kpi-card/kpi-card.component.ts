import { Component, input, viewChild, AfterViewInit, OnDestroy, ElementRef, effect, signal } from '@angular/core';
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
  private lastValue: number | string = '';

  displayValue = signal<string | number>('');
  private animationId?: number;

  constructor() {
    effect(() => {
      const value = this.value();

      // Animate value if it's a number
      if (typeof value === 'number') {
        const start = typeof this.displayValue() === 'number' ? (this.displayValue() as number) : 0;
        this.animateValue(start, value, 800);
      } else {
        this.displayValue.set(value);
      }

      // Only update sparkline if chart exists and value actually changed
      if (this.showSparkline() && this.sparklineChart && value !== this.lastValue) {
        this.lastValue = value;
        this.updateSparklineData();
      }
    });
  }

  ngAfterViewInit() {
    if (this.showSparkline() && this.sparkline()) {
      this.sparklineData = this.generateSparklineData();
      this.lastValue = this.value();
      this.renderSparkline();
    }
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.sparklineChart?.destroy();
  }

  private animateValue(start: number, end: number, duration: number) {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad animation curve
      const easeProgress = progress * (2 - progress);
      const current = Math.round(start + (end - start) * easeProgress);
      this.displayValue.set(current);

      if (progress < 1) {
        this.animationId = requestAnimationFrame(update);
      }
    };

    this.animationId = requestAnimationFrame(update);
  }

  /**
   * Generates deterministic sparkline data based on current value and trend.
   * Uses a simple algorithm instead of Math.random() to avoid triggering
   * infinite re-renders when called inside an Angular effect().
   */
  private generateSparklineData(): number[] {
    const trend = this.trend() === 'up' ? 1 : -1;
    const baseValue = typeof this.value() === 'number' ? this.value() as number : 10;
    return Array.from({ length: 7 }, (_, i) => {
      // Deterministic variation using index and baseValue
      const variation = ((i * 3 + baseValue) % 5) + 1;
      return Math.max(0, baseValue + (trend * variation * i / 7));
    });
  }

  private updateSparklineData() {
    if (!this.sparklineChart) return;

    const newData = this.generateSparklineData();
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

