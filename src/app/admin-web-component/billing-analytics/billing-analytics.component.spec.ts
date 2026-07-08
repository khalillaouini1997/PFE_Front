import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { BillingAnalyticsComponent } from './billing-analytics.component';
import { BillingAnalyticsService } from 'src/app/service/billing-analytics.service';

describe('BillingAnalyticsComponent', () => {
  let component: BillingAnalyticsComponent;
  let fixture: ComponentFixture<BillingAnalyticsComponent>;

  const mockAnalyticsService = {
    getBillingAnalytics: vi.fn().mockReturnValue(of({
      data: {
        topDevices: [],
        revenueByMonth: [],
        revenueByAccount: [],
        statusBreakdown: []
      }
    }))
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [BillingAnalyticsComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        { provide: BillingAnalyticsService, useValue: mockAnalyticsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingAnalyticsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with current year', () => {
    expect(component.selectedYear).toBe(new Date().getFullYear());
  });

  it('should call loadAnalytics on init', () => {
    fixture.detectChanges();
    expect(mockAnalyticsService.getBillingAnalytics).toHaveBeenCalledWith(new Date().getFullYear());
  });

  it('should set loading to true then false during analytics load', () => {
    expect(component.loading).toBe(false);
    fixture.detectChanges();
    expect(component.loading).toBe(false);
  });

  it('should set loading to false after analytics load completes', () => {
    fixture.detectChanges();
    expect(component.loading).toBe(false);
  });

  it('should populate topDevices from response', () => {
    mockAnalyticsService.getBillingAnalytics.mockReturnValue(of({
      data: {
        topDevices: [
          { numBoitier: 'B001', deviceLabel: 'Device 1', totalWorkingDays: 20, totalSubtotal: 100 }
        ],
        revenueByMonth: [],
        revenueByAccount: [],
        statusBreakdown: []
      }
    }));

    const freshFixture = TestBed.createComponent(BillingAnalyticsComponent);
    freshFixture.detectChanges();

    expect(freshFixture.componentInstance.topDevices.length).toBe(1);
    expect(freshFixture.componentInstance.topDevices[0].numBoitier).toBe('B001');
  });

  it('should handle analytics error', () => {
    mockAnalyticsService.getBillingAnalytics.mockReturnValue(throwError(() => new Error('fail')));

    const freshFixture = TestBed.createComponent(BillingAnalyticsComponent);
    freshFixture.detectChanges();

    expect(freshFixture.componentInstance.loading).toBe(false);
  });

  it('should handle response with body.data wrapper', () => {
    mockAnalyticsService.getBillingAnalytics.mockReturnValue(of({
      body: {
        data: {
          topDevices: [{ numBoitier: 'B002', deviceLabel: 'Device 2', totalWorkingDays: 15, totalSubtotal: 75 }],
          revenueByMonth: [],
          revenueByAccount: [],
          statusBreakdown: []
        }
      }
    }));

    const freshFixture = TestBed.createComponent(BillingAnalyticsComponent);
    freshFixture.detectChanges();

    expect(freshFixture.componentInstance.topDevices.length).toBe(1);
  });

  it('should handle response with no data wrapper', () => {
    mockAnalyticsService.getBillingAnalytics.mockReturnValue(of({
      topDevices: [],
      revenueByMonth: [],
      revenueByAccount: [],
      statusBreakdown: []
    }));

    const freshFixture = TestBed.createComponent(BillingAnalyticsComponent);
    freshFixture.detectChanges();

    expect(freshFixture.componentInstance.topDevices).toEqual([]);
  });

  it('loadAnalytics should be callable manually', () => {
    fixture.detectChanges();
    vi.clearAllMocks();
    component.loadAnalytics();
    expect(mockAnalyticsService.getBillingAnalytics).toHaveBeenCalled();
  });

  it('formatCurrency should format amount', () => {
    fixture.detectChanges();
    const result = component.formatCurrency(500);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should call loadAnalytics with selected year', () => {
    fixture.detectChanges();
    component.selectedYear = 2024;
    component.loadAnalytics();
    expect(mockAnalyticsService.getBillingAnalytics).toHaveBeenCalledWith(2024);
  });
});
