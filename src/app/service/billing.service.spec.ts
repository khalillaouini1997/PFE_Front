import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { BillingService } from './billing.service';
import { environment } from '../../environments/environment';

describe('BillingService', () => {
  let service: BillingService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiBaseUrl}billing`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BillingService,
      ],
    });

    service = TestBed.inject(BillingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateMonthlyBilling', () => {
    it('should make GET request with account id, year, month', () => {
      const accountId = 1;
      const year = 2024;
      const month = 6;

      service.calculateMonthlyBilling(accountId, year, month).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/account/${accountId}/${year}/${month}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ total: 150.5 });
    });
  });

  describe('triggerAllAccountsBilling', () => {
    it('should make POST request to schedule trigger', () => {
      service.triggerAllAccountsBilling().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/schedule/trigger`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush({ triggered: true });
    });
  });

  describe('triggerAccountBilling', () => {
    it('should make POST request with account id', () => {
      const accountId = 5;

      service.triggerAccountBilling(accountId).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/schedule/trigger/${accountId}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush({ triggered: true });
    });
  });

  describe('refreshMonthlyBilling', () => {
    it('should make POST request to refresh billing', () => {
      const accountId = 1;
      const year = 2024;
      const month = 6;

      service.refreshMonthlyBilling(accountId, year, month).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/account/${accountId}/${year}/${month}/refresh`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush({ refreshed: true });
    });
  });

  describe('downloadPdfReport', () => {
    it('should make GET request with blob response type', () => {
      const accountId = 1;
      const year = 2024;
      const month = 6;

      service.downloadPdfReport(accountId, year, month).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/account/${accountId}/${year}/${month}/pdf`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob());
    });
  });

  describe('checkExistingInvoice', () => {
    it('should make GET request to check invoice', () => {
      const accountId = 1;
      const year = 2024;
      const month = 6;

      service.checkExistingInvoice(accountId, year, month).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/account/${accountId}/${year}/${month}/check`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ exists: true });
    });
  });

  describe('getAllInvoicesByAccount', () => {
    it('should make GET request for invoices', () => {
      const accountId = 1;

      service.getAllInvoicesByAccount(accountId).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/account/${accountId}/invoices`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('generateBatchBilling', () => {
    it('should make POST request with JSON content type', () => {
      const accountId = 1;
      const startYear = 2024;
      const startMonth = 1;

      service.generateBatchBilling(accountId, startYear, startMonth).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/account/${accountId}/batch`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ startYear, startMonth });
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({ generated: 12 });
    });
  });

  describe('updatePaymentStatus', () => {
    it('should make PUT request with status body', () => {
      const accountId = 1;
      const year = 2024;
      const month = 6;
      const status = 'paid';

      service.updatePaymentStatus(accountId, year, month, status).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/account/${accountId}/${year}/${month}/status`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status });
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({ updated: true });
    });
  });
});
