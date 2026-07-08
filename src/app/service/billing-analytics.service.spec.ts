import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { BillingAnalyticsService } from './billing-analytics.service';
import { environment } from '../../environments/environment';

describe('BillingAnalyticsService', () => {
  let service: BillingAnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BillingAnalyticsService,
      ],
    });
    service = TestBed.inject(BillingAnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBillingAnalytics', () => {
    it('should GET analytics for the given year', () => {
      const year = 2024;
      const mockResponse = { revenue: 100000, expenses: 50000 };

      service.getBillingAnalytics(year).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}billing/analytics/${year}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getRevenueHistory', () => {
    it('should GET revenue history', () => {
      const mockResponse = [{ month: 'Jan', revenue: 10000 }];

      service.getRevenueHistory().subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}billing/revenue-history`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getRevenueForecast', () => {
    it('should POST revenue forecast with default 6 months', () => {
      const monthlyRevenue = [1000, 2000, 3000];
      const mockResponse = { forecast: [4000, 5000, 6000] };

      service.getRevenueForecast(monthlyRevenue).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8000/api/revenue/forecast');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        monthly_revenue: monthlyRevenue,
        forecast_months: 6,
      });
      req.flush(mockResponse);
    });

    it('should POST revenue forecast with custom months', () => {
      const monthlyRevenue = [1000, 2000, 3000];
      const forecastMonths = 12;
      const mockResponse = { forecast: [4000, 5000] };

      service.getRevenueForecast(monthlyRevenue, forecastMonths).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8000/api/revenue/forecast');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        monthly_revenue: monthlyRevenue,
        forecast_months: forecastMonths,
      });
      req.flush(mockResponse);
    });
  });
});
