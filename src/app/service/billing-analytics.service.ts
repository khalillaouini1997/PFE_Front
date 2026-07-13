import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class BillingAnalyticsService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly anomalyServiceUrl = 'http://localhost:8000';

  constructor(private readonly http: HttpClient) {
  }

  getBillingAnalytics(year: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}billing/analytics/${year}`);
  }

  getRevenueHistory(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}billing/revenue-history`);
  }

  getRevenueForecast(monthlyRevenue: number[], forecastMonths: number = 6): Observable<any> {
    return this.http.post(`${this.anomalyServiceUrl}/api/revenue/forecast`, {
      monthly_revenue: monthlyRevenue,
      forecast_months: forecastMonths
    });
  }
}
