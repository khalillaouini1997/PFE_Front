import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  calculateMonthlyBilling(accountId: number, year: number, month: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}billing/account/${accountId}/${year}/${month}`);
  }

  refreshMonthlyBilling(accountId: number, year: number, month: number): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}billing/account/${accountId}/${year}/${month}/refresh`, null);
  }

  downloadPdfReport(accountId: number, year: number, month: number): Observable<Blob> {
    return this.http.get(
      `${this.apiBaseUrl}billing/account/${accountId}/${year}/${month}/pdf`,
      { responseType: 'blob' }
    );
  }
}
