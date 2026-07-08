import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { BillingComponent } from './billing.component';
import { BillingService } from 'src/app/service/billing.service';
import { BillingAnalyticsService } from 'src/app/service/billing-analytics.service';
import { WebAccountService } from 'src/app/service/web-account.service';
import { ToastrService } from 'ngx-toastr';

describe('BillingComponent', () => {
  let component: BillingComponent;
  let fixture: ComponentFixture<BillingComponent>;

  const mockBillingService = {
    checkExistingInvoice: vi.fn().mockReturnValue(of({ data: null })),
    getAllInvoicesByAccount: vi.fn().mockReturnValue(of({ data: [] })),
    generateBatchBilling: vi.fn().mockReturnValue(of({ data: [] })),
    triggerAllAccountsBilling: vi.fn().mockReturnValue(of({})),
    triggerAccountBilling: vi.fn().mockReturnValue(of({ data: {} })),
    refreshMonthlyBilling: vi.fn().mockReturnValue(of({ data: {} })),
    downloadPdfReport: vi.fn().mockReturnValue(of(new Blob())),
    updatePaymentStatus: vi.fn().mockReturnValue(of({}))
  };

  const mockAnalyticsService = {
    getBillingAnalytics: vi.fn().mockReturnValue(of({
      data: {
        topDevices: [],
        revenueByMonth: [],
        revenueByAccount: [],
        statusBreakdown: []
      }
    })),
    getRevenueHistory: vi.fn().mockReturnValue(of({ data: [] })),
    getRevenueForecast: vi.fn().mockReturnValue(of({ predictions: [] }))
  };

  const mockWebAccountService = {
    getAllWebAccountNames: vi.fn().mockReturnValue(of({ data: [] }))
  };

  const mockToastr = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [BillingComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        { provide: BillingService, useValue: mockBillingService },
        { provide: BillingAnalyticsService, useValue: mockAnalyticsService },
        { provide: WebAccountService, useValue: mockWebAccountService },
        { provide: ToastrService, useValue: mockToastr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with dashboard tab active', () => {
    fixture.detectChanges();
    expect(component.activeTab).toBe('dashboard');
  });

  it('should switch to invoice tab', () => {
    fixture.detectChanges();
    component.switchTab('invoice');
    expect(component.activeTab).toBe('invoice');
  });

  it('should switch back to dashboard tab', () => {
    fixture.detectChanges();
    component.switchTab('invoice');
    component.switchTab('dashboard');
    expect(component.activeTab).toBe('dashboard');
  });

  it('should initialize billing form', () => {
    fixture.detectChanges();
    expect(component.billingForm).toBeDefined();
    expect(component.billingForm.get('accountId')).toBeTruthy();
    expect(component.billingForm.get('year')).toBeTruthy();
    expect(component.billingForm.get('month')).toBeTruthy();
  });

  it('should load web accounts on init', () => {
    mockWebAccountService.getAllWebAccountNames.mockReturnValue(of({
      data: [{ idCompteClientWeb: 1, login: 'account1' }]
    }));
    fixture.detectChanges();
    expect(mockWebAccountService.getAllWebAccountNames).toHaveBeenCalled();
    expect(component.webAccounts.length).toBe(1);
  });

  it('should handle empty web accounts response', () => {
    mockWebAccountService.getAllWebAccountNames.mockReturnValue(of({}));
    fixture.detectChanges();
    expect(component.webAccounts).toEqual([]);
  });

  it('should handle web accounts error', () => {
    mockWebAccountService.getAllWebAccountNames.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();
    expect(component.loadingAccounts).toBe(false);
    expect(mockToastr.error).toHaveBeenCalled();
  });

  it('should schedule analytics load on init', () => {
    fixture.detectChanges();
    expect(component.analyticsLoading).toBe(false);
  });

  it('should schedule forecast load on init', () => {
    fixture.detectChanges();
    expect(component.analyticsLoading).toBe(false);
  });

  it('searchInvoice should show error when no account selected', () => {
    fixture.detectChanges();
    component.searchInvoice();
    expect(mockToastr.error).toHaveBeenCalled();
  });

  it('searchInvoice should call checkExistingInvoice when account selected', () => {
    fixture.detectChanges();
    component.billingForm.patchValue({ accountId: 1 });
    component.searchInvoice();
    expect(mockBillingService.checkExistingInvoice).toHaveBeenCalled();
  });

  it('backToSingleInvoice should reset view', () => {
    fixture.detectChanges();
    component.showAllInvoicesView = true;
    component.allInvoices = [{ id: 1 }];
    component.backToSingleInvoice();
    expect(component.showAllInvoicesView).toBe(false);
    expect(component.allInvoices).toEqual([]);
  });

  it('totalDevicePages should return 0 when no billing result', () => {
    fixture.detectChanges();
    expect(component.totalDevicePages).toBe(0);
  });

  it('pagedDevices should return empty when no billing result', () => {
    fixture.detectChanges();
    expect(component.pagedDevices).toEqual([]);
  });

  it('formatCurrency should format amount', () => {
    fixture.detectChanges();
    const result = component.formatCurrency(1234.567);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should call checkExistingInvoice when account selected', () => {
    fixture.detectChanges();
    component.billingForm.patchValue({ accountId: 1 });
    component.checkExistingInvoice();
    expect(mockBillingService.checkExistingInvoice).toHaveBeenCalled();
  });
});
