import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmbedTokenRequest {
  reportId: string;
  datasetId?: string;
}

export interface EmbedTokenResponse {
  reportId: string;
  embedUrl: string;
  token: string;
  expirationTime: string;
  tokenId: string;
}

export interface ReportInfo {
  reportId: string;
  reportName: string;
  reportType: string;
}

export interface DashboardMetrics {
  total_devices: number;
  active_devices: number;
  avg_speed: number;
  moving_devices: number;
}

@Injectable({
  providedIn: 'root'
})
export class PowerBIService {
  private http = inject(HttpClient);
  
  getAvailableReports(): Observable<ReportInfo[]> {
    return this.http.get<ReportInfo[]>(
      `${environment.apiBaseUrl}api/powerbi/reports`
    );
  }
  
  getDashboardMetrics(timeRange: string = 'month'): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(
      `${environment.apiBaseUrl}api/powerbi/metrics`,
      { params: { timeRange } }
    );
  }
  
  getDevicePerformance(deviceId: string, startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiBaseUrl}api/powerbi/device-performance`,
      { params: { deviceId, startDate, endDate } }
    );
  }
  
  getUserActivity(userId: string, startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiBaseUrl}api/powerbi/user-activity`,
      { params: { userId, startDate, endDate } }
    );
  }
  
  getMaintenance(deviceId: string, startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiBaseUrl}api/powerbi/maintenance`,
      { params: { deviceId, startDate, endDate } }
    );
  }
  
  getRevenue(accountId: string, startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiBaseUrl}api/powerbi/revenue`,
      { params: { accountId, startDate, endDate } }
    );
  }

  // Manual ETL trigger methods
  triggerDimDeviceETL(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiBaseUrl}api/powerbi/etl/sync-dim-device`,
      {}
    );
  }

  triggerDimUserETL(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiBaseUrl}api/powerbi/etl/sync-dim-user`,
      {}
    );
  }

  triggerDevicePerformanceETL(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiBaseUrl}api/powerbi/etl/sync-device-performance`,
      {}
    );
  }

  triggerUserActivityETL(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiBaseUrl}api/powerbi/etl/sync-user-activity`,
      {}
    );
  }

  triggerMaintenanceETL(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiBaseUrl}api/powerbi/etl/sync-maintenance`,
      {}
    );
  }

  triggerRevenueETL(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiBaseUrl}api/powerbi/etl/sync-revenue`,
      {}
    );
  }

  triggerAllETL(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.apiBaseUrl}api/powerbi/etl/sync-all`,
      {}
    );
  }
}
