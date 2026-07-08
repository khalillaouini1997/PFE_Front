import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalDashboardComponent } from './global-dashboard.component';
import { GlobalDashboardStore } from 'src/app/shared/stores';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from 'src/app/service/web-account.service';

vi.mock('chart.js', () => {
  class MockChart {
    data = { labels: [], datasets: [] };
    update = vi.fn();
    destroy = vi.fn();
    static register = vi.fn();
  }
  return {
    Chart: MockChart,
    registerables: []
  };
});

describe('GlobalDashboardComponent', () => {
  let component: GlobalDashboardComponent;
  let fixture: ComponentFixture<GlobalDashboardComponent>;

  const mockStore = {
    init: vi.fn(),
    ngOnDestroy: vi.fn(),
    refresh: vi.fn(),
    summaries: signal([] as any[]),
    mapRealtimes: signal([] as any[]),
    stats: signal({
      totalVehicles: 0,
      valid: 0,
      technicalIssue: 0,
      nonValid: 0,
      moving: 0,
      stopped: 0,
      ignitionOn: 0,
      accountsCount: 0,
      inactive: 0
    }),
    loading: signal(false),
    activityFeed: signal([] as any[]),
    comptesWeb: signal([] as any[]),
    deviceCount: signal(0),
    error: signal<string | null>(null),
    accountPage: signal(0)
  };

  const mockAuthService = {
    isAuthenticated: vi.fn().mockReturnValue(true)
  };

  const mockWebAccountService = {
    exportLastTram: vi.fn().mockReturnValue(of(new Blob()))
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockStore.summaries.set([]);
    mockStore.loading.set(false);

    await TestBed.configureTestingModule({
      imports: [GlobalDashboardComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: GlobalDashboardStore, useValue: mockStore },
        { provide: AuthService, useValue: mockAuthService },
        { provide: WebAccountService, useValue: mockWebAccountService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalDashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call store.init when authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    fixture.detectChanges();
    expect(mockStore.init).toHaveBeenCalled();
  });

  it('should not call store.init when not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    fixture.detectChanges();
    expect(mockStore.init).not.toHaveBeenCalled();
  });

  it('should expose store summaries', () => {
    fixture.detectChanges();
    expect(component.realtimes()).toEqual(mockStore.summaries());
  });

  it('should expose store stats', () => {
    fixture.detectChanges();
    expect(component.stats()).toEqual(mockStore.stats());
  });

  it('should expose store loading', () => {
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
  });

  it('onRefresh should call store.refresh', () => {
    fixture.detectChanges();
    component.onRefresh();
    expect(mockStore.refresh).toHaveBeenCalled();
  });

  it('onExport should not export when no realtimes', () => {
    fixture.detectChanges();
    mockStore.summaries.set([]);
    component.onExport();
    expect(mockWebAccountService.exportLastTram).not.toHaveBeenCalled();
  });

  it('onExport should export when realtimes present', () => {
    fixture.detectChanges();
    mockStore.summaries.set([{ id: 1 }] as any[]);
    component.onExport();
    expect(mockWebAccountService.exportLastTram).toHaveBeenCalled();
  });

  it('ngOnDestroy should call store.ngOnDestroy', () => {
    fixture.detectChanges();
    component.ngOnDestroy();
    expect(mockStore.ngOnDestroy).toHaveBeenCalled();
  });
});
