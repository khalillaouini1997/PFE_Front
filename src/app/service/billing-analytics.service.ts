import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BillingAnalyticsService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getBillingAnalytics(year: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}billing/analytics/${year}`);
  }
}
