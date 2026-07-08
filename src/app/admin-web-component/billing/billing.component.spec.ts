import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BillingComponent } from './billing.component';
import { BillingService } from '../../service/billing.service';
import { BillingAnalyticsService } from '../../service/billing-analytics.service';
import { WebAccountService } from '../../service/web-account.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

describe('BillingComponent', () => {
  let component: BillingComponent;
  let billingService: { checkExistingInvoice: ReturnType<typeof vi.fn>; generateBatchBilling: ReturnType<typeof vi.fn>; triggerAllAccountsBilling: ReturnType<typeof vi.fn>; triggerAccountBilling: ReturnType<typeof vi.fn>; refreshMonthlyBilling: ReturnType<typeof vi.fn>; downloadPdfReport: ReturnType<typeof vi.fn>; updatePaymentStatus: ReturnType<typeof vi.fn>; getAllInvoicesByAccount: ReturnType<typeof vi.fn> };
  let analyticsService: { getBillingAnalytics: ReturnType<typeof vi.fn>; getRevenueHistory: ReturnType<typeof vi.fn>; getRevenueForecast: ReturnType<typeof vi.fn> };
  let webAccountService: { getAllWebAccountNames: ReturnType<typeof vi.fn> };
  let toastr: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };
  let translate: { instant: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    billingService = {
      checkExistingInvoice: vi.fn(),
      generateBatchBilling: vi.fn(),
      triggerAllAccountsBilling: vi.fn(),
      triggerAccountBilling: vi.fn(),
      refreshMonthlyBilling: vi.fn(),
      downloadPdfReport: vi.fn(),
      updatePaymentStatus: vi.fn(),
      getAllInvoicesByAccount: vi.fn(),
    };
    analyticsService = {
      getBillingAnalytics: vi.fn().mockReturnValue(of({ data: { topDevices: [], revenueByMonth: [], revenueByAccount: [], statusBreakdown: [] } })),
      getRevenueHistory: vi.fn().mockReturnValue(of({ data: [] })),
      getRevenueForecast: vi.fn().mockReturnValue(of({ predictions: [] })),
    };
    webAccountService = { getAllWebAccountNames: vi.fn().mockReturnValue(of({ data: [] })) };
    toastr = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
    translate = { instant: vi.fn().mockReturnValue(''), get: vi.fn().mockReturnValue(of('')) };

    await TestBed.configureTestingModule({
      imports: [BillingComponent, TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: { getTranslation: () => of({}) } } })],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BillingService, useValue: billingService },
        { provide: BillingAnalyticsService, useValue: analyticsService },
        { provide: WebAccountService, useValue: webAccountService },
        { provide: ToastrService, useValue: toastr },
        { provide: TranslateService, useValue: translate }
      ]
    }).compileComponents();

    component = TestBed.createComponent(BillingComponent).componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on init', () => {
    component.ngOnInit();
    expect(component.billingForm).toBeTruthy();
    expect(component.billingForm.get('accountId')).toBeTruthy();
  });

  it('should load web accounts', () => {
    component.ngOnInit();
    expect(webAccountService.getAllWebAccountNames).toHaveBeenCalled();
    expect(component.webAccounts).toEqual([]);
  });

  it('should handle web accounts error', () => {
    webAccountService.getAllWebAccountNames.mockReturnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(toastr.error).toHaveBeenCalled();
  });

  it('should search invoice', () => {
    component.ngOnInit();
    component.billingForm.patchValue({ accountId: '123' });
    billingService.checkExistingInvoice.mockReturnValue(of({ data: { billingPeriod: '2024-01' } }));
    component.searchInvoice();
    expect(billingService.checkExistingInvoice).toHaveBeenCalled();
  });

  it('should show error when no account selected', () => {
    component.ngOnInit();
    component.searchInvoice();
    expect(toastr.error).toHaveBeenCalled();
  });

  it('should check existing invoice', () => {
    component.ngOnInit();
    component.billingForm.patchValue({ accountId: '123', year: 2024, month: 1 });
    billingService.checkExistingInvoice.mockReturnValue(of({ data: { billingPeriod: '2024-01' } }));
    component.checkExistingInvoice();
    expect(component.billingResult).toBeTruthy();
  });

  it('should handle no existing invoice', () => {
    component.ngOnInit();
    component.billingForm.patchValue({ accountId: '123' });
    billingService.checkExistingInvoice.mockReturnValue(of({ data: null }));
    component.checkExistingInvoice();
    expect(component.noExistingInvoice).toBe(true);
  });

  it('should calculate billing', () => {
    component.ngOnInit();
    component.billingForm.patchValue({ accountId: '123' });
    billingService.generateBatchBilling.mockReturnValue(of({ data: [{ billingPeriod: '2024-01' }] }));
    component.calculateBilling();
    expect(component.loading).toBe(false);
  });

  it('should show error when no account for calculate', () => {
    component.ngOnInit();
    component.calculateBilling();
    expect(toastr.error).toHaveBeenCalled();
  });

  it('should calculate all accounts', () => {
    billingService.triggerAllAccountsBilling.mockReturnValue(of({}));
    component.calculateAllAccounts();
    expect(component.loading).toBe(false);
  });

  it('should calculate specific account', () => {
    component.ngOnInit();
    component.billingForm.patchValue({ accountId: '123' });
    billingService.triggerAccountBilling.mockReturnValue(of({ data: {} }));
    component.calculateSpecificAccount();
    expect(component.loading).toBe(false);
  });

  it('should refresh billing', () => {
    component.ngOnInit();
    component.billingForm.patchValue({ accountId: '123', year: 2024, month: 1 });
    billingService.refreshMonthlyBilling.mockReturnValue(of({ data: { billingPeriod: '2024-01' } }));
    component.refreshBilling();
    expect(component.billingResult).toBeTruthy();
  });

  it('should toggle payment status', () => {
    component.billingResult = { paymentStatus: 'PAID' };
    component.ngOnInit();
    component.billingForm.patchValue({ accountId: '123', year: 2024, month: 1 });
    billingService.updatePaymentStatus.mockReturnValue(of({}));
    component.togglePaymentStatus();
    expect(component.billingResult.paymentStatus).toBe('UNPAID');
  });

  it('should not toggle when no result', () => {
    component.billingResult = null;
    component.togglePaymentStatus();
    expect(billingService.updatePaymentStatus).not.toHaveBeenCalled();
  });

  it('should switch tabs', () => {
    component.switchTab('invoice');
    expect(component.activeTab).toBe('invoice');
    component.switchTab('dashboard');
    expect(component.activeTab).toBe('dashboard');
  });

  it('should format currency', () => {
    const result = component.formatCurrency(1234.567);
    expect(result).toContain('TND');
  });

  it('should fetch all invoices', () => {
    component.ngOnInit();
    component.billingForm.patchValue({ accountId: '123' });
    billingService.getAllInvoicesByAccount.mockReturnValue(of({ data: [{ billingPeriod: '2024-01' }] }));
    component.fetchAllInvoices();
    expect(component.allInvoices.length).toBe(1);
    expect(component.showAllInvoicesView).toBe(true);
  });

  it('should back to single invoice', () => {
    component.backToSingleInvoice();
    expect(component.showAllInvoicesView).toBe(false);
  });

  it('should view invoice', () => {
    component.viewInvoice({ billingPeriod: '2024-01', totalAmount: 100 });
    expect(component.billingResult.billingPeriod).toBe('2024-01');
    expect(component.showAllInvoicesView).toBe(false);
  });

  it('should compute totalDevicePages', () => {
    component.billingResult = { deviceBreakdown: Array(25) };
    component.pageSize = 10;
    expect(component.totalDevicePages).toBe(3);
  });

  it('should compute pagedDevices', () => {
    component.billingResult = { deviceBreakdown: Array.from({ length: 25 }, (_, i) => ({ id: i })) };
    component.pageSize = 10;
    component.devicePage = 1;
    expect(component.pagedDevices.length).toBe(10);
  });

  it('should destroy chart instances', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
