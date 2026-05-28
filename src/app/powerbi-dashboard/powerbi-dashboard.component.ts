import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PowerBIService, DashboardMetrics } from '../service/powerbi.service';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-powerbi-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './powerbi-dashboard.component.html',
  styleUrls: ['./powerbi-dashboard.component.scss']
})
export class PowerBIDashboardComponent implements OnInit {
  private powerbiService = inject(PowerBIService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  
  reportId: string = '';
  metrics: DashboardMetrics | null = null;
  loading: boolean = false;
  error: string = '';
  
  etlLoading = signal(false);
  etlMessage = signal('');
  etlSuccess = signal(false);
  
  ngOnInit() {
    this.reportId = this.route.snapshot.paramMap.get('reportId') || 'fleet-performance';
    this.loadDashboard();
  }
  
  loadDashboard() {
    this.loading = true;
    this.error = '';
    
    this.powerbiService.getDashboardMetrics('month').subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load Power BI dashboard: ' + err.message;
        this.loading = false;
      }
    });
  }
  
  refreshDashboard() {
    this.loadDashboard();
  }

  triggerETL(etlType: string) {
    this.etlLoading.set(true);
    this.etlMessage.set('');
    this.etlSuccess.set(false);
    
    let observable;
    switch (etlType) {
      case 'dim-device':
        observable = this.powerbiService.triggerDimDeviceETL();
        break;
      case 'dim-user':
        observable = this.powerbiService.triggerDimUserETL();
        break;
      case 'device-performance':
        observable = this.powerbiService.triggerDevicePerformanceETL();
        break;
      case 'user-activity':
        observable = this.powerbiService.triggerUserActivityETL();
        break;
      case 'maintenance':
        observable = this.powerbiService.triggerMaintenanceETL();
        break;
      case 'revenue':
        observable = this.powerbiService.triggerRevenueETL();
        break;
      case 'all':
        observable = this.powerbiService.triggerAllETL();
        break;
      default:
        this.etlLoading.set(false);
        this.etlMessage.set('Unknown ETL type');
        return;
    }
    
    observable.subscribe({
      next: (response) => {
        this.etlLoading.set(false);
        this.etlSuccess.set(response.success);
        this.etlMessage.set(response.message);
        if (response.success) {
          setTimeout(() => {
            this.etlMessage.set('');
            this.etlSuccess.set(false);
          }, 3000);
        }
      },
      error: (err) => {
        this.etlLoading.set(false);
        this.etlSuccess.set(false);
        this.etlMessage.set('Error: ' + err.message);
      }
    });
  }
}
