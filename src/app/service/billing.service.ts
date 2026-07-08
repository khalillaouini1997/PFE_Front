import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  calculateMonthlyBilling(accountId: number, year: number, month: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}billing/account/${accountId}/${year}/${month}`);
  }

  triggerAllAccountsBilling(): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}billing/schedule/trigger`, null);
  }

  triggerAccountBilling(accountId: number): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}billing/schedule/trigger/${accountId}`, null);
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

  checkExistingInvoice(accountId: number, year: number, month: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}billing/account/${accountId}/${year}/${month}/check`);
  }

  getAllInvoicesByAccount(accountId: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}billing/account/${accountId}/invoices`);
  }

  generateBatchBilling(accountId: number, startYear: number, startMonth: number): Observable<any> {
    return this.http.post(
      `${this.apiBaseUrl}billing/account/${accountId}/batch`,
      { startYear, startMonth },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  updatePaymentStatus(accountId: number, year: number, month: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiBaseUrl}billing/account/${accountId}/${year}/${month}/status`,
      { status },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
