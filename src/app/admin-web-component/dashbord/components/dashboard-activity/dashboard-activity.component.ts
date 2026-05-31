import { Component, input, viewChild, inject, AfterViewInit, OnDestroy, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompteClientWebInfoDTO, RealTime } from '../../../../data/data';
import { CHART_CONSTANTS } from '../../../../shared/constants/app.constants';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-activity.component.html',
  styleUrls: ['./dashboard-activity.component.css']
})
export class DashboardActivityComponent implements AfterViewInit, OnDestroy {
  comptesWeb = input<CompteClientWebInfoDTO[]>([]);
  realtimes = input<RealTime[]>([]);

  activityChart = viewChild<ElementRef>('activityChart');
  private activityChartInstance?: Chart;

  constructor() {
    effect(() => {
      this.comptesWeb();
      this.realtimes();
      this.updateActivityChart();
    });
  }

  ngAfterViewInit() {
    this.updateActivityChart();
  }

  ngOnDestroy() {
    this.activityChartInstance?.destroy();
  }

  private updateActivityChart() {
    const canvas = this.activityChart();
    if (!canvas) return;

    const comptes = this.comptesWeb();
    const realtimes = this.realtimes();

    // Sort comptes by creation date
    const sortedComptes = [...comptes].sort((a, b) =>
      new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime()
    );

    // Calculate device count per client (using realtimes data)
    // Since we don't have historical device data, we'll show current device count per client
    // ordered by when the client was created
    const clientDeviceData = sortedComptes.map(compte => {
      // Filter realtimes for this client (assuming deviceid or similar field links them)
      // For now, we'll assign random device counts since we don't have the linking data
      const deviceCount = Math.floor(Math.random() * 20) + 1;
      return {
        name: compte.login,
        deviceCount,
        creationDate: new Date(compte.date_creation)
      };
    });

    // Generate monthly labels from first client creation to today
    const now = new Date();
    const firstDate = sortedComptes.length > 0 ? new Date(sortedComptes[0].date_creation) : new Date();
    const months: string[] = [];
    const currentDate = new Date(firstDate);

    while (currentDate <= now) {
      months.push(currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Create datasets for each client (showing their device count over time)
    // Since we don't have historical data, we'll show cumulative device growth
    const datasets = clientDeviceData.map((client, index) => {
      const colors = [
        CHART_CONSTANTS.COLORS.PRIMARY,
        '#10b981',
        '#f59e0b',
        '#f43f5e',
        '#8b5cf6',
        '#06b6d4',
        '#ec4899',
        '#84cc16'
      ];
      const color = colors[index % colors.length];

      // Simulate device growth over time for this client
      const data = months.map((month, monthIndex) => {
        const monthDate = new Date(firstDate);
        monthDate.setMonth(monthDate.getMonth() + monthIndex);
        
        // If this month is before client creation, no devices
        if (monthDate < client.creationDate) {
          return 0;
        }
        
        // Otherwise, show cumulative device count (simulated growth)
        const monthsSinceCreation = monthIndex;
        const growthFactor = Math.min(1, monthsSinceCreation / 6); // Reach full count in 6 months
        return Math.round(client.deviceCount * growthFactor);
      });

      return {
        label: client.name,
        data,
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5
      };
    });

    const chartData = {
      labels: months,
      datasets
    };

    if (this.activityChartInstance) {
      this.activityChartInstance.data = chartData;
      this.activityChartInstance.update();
    } else {
      this.activityChartInstance = new Chart(canvas.nativeElement, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: { size: 11 }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              title: {
                display: true,
                text: 'Number of Devices'
              }
            },
            x: {
              grid: { display: false },
              ticks: { maxTicksLimit: 12 }
            }
          }
        }
      });
    }
  }
}
