import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardChartsComponent } from './dashboard-charts.component';
import { TranslateService } from '@ngx-translate/core';
import { DashboardStore } from '../../../../shared/stores';

describe('DashboardChartsComponent', () => {
  let component: DashboardChartsComponent;
  let fixture: ComponentFixture<DashboardChartsComponent>;
  let store: { setGranularity: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    store = { setGranularity: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [DashboardChartsComponent],
      providers: [
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: DashboardStore, useValue: store }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardChartsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.realtimes()).toEqual([]);
    expect(component.stats()).toEqual({ total: 0, valid: 0, technicalIssue: 0, moving: 0 });
    expect(component.installationEvolution()).toEqual([]);
    expect(component.granularity()).toBe('month');
  });

  it('should call store.setGranularity on onGranularityChange', () => {
    const event = { target: { value: 'week' } } as any;
    component.onGranularityChange(event);
    expect(store.setGranularity).toHaveBeenCalledWith('week');
  });

  it('should destroy chart instances on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should accept realtimes with various speed values', () => {
    fixture.componentRef.setInput('realtimes', [
      { deviceid: 1, speed: 0, status: 'VALID', numPuce: '8921601001', signal: 25, matricule: 'T-001', latitude: 33.88, longitude: 9.53, validity: true, ignition: true, record_time: new Date(), imei: '123', version: 'v1' },
      { deviceid: 2, speed: 15, status: 'VALID', numPuce: '8921602002', signal: 18, matricule: 'T-002', latitude: 33.89, longitude: 9.54, validity: true, ignition: true, record_time: new Date(), imei: '124', version: 'v1' },
      { deviceid: 3, speed: 45, status: 'VALID', numPuce: '8921603003', signal: 12, matricule: 'T-003', latitude: 33.90, longitude: 9.55, validity: true, ignition: false, record_time: new Date(), imei: '125', version: 'v1' },
      { deviceid: 4, speed: 80, status: 'NON_VALID', numPuce: '8921604004', signal: 5, matricule: 'T-004', latitude: 33.91, longitude: 9.56, validity: false, ignition: false, record_time: new Date(), imei: '126', version: 'v1' },
      { deviceid: 5, speed: 0, status: 'TECHNICAL_ISSUE', numPuce: '123456', signal: 3, matricule: 'T-005', latitude: 33.92, longitude: 9.57, validity: false, ignition: false, record_time: new Date(), imei: '127', version: 'v1' },
    ]);
    expect(component.realtimes().length).toBe(5);
  });

  it('should accept stats input', () => {
    fixture.componentRef.setInput('stats', {
      total: 100, valid: 75, technicalIssue: 15, moving: 50
    });
    expect(component.stats().total).toBe(100);
  });

  it('should accept installationEvolution input', () => {
    fixture.componentRef.setInput('installationEvolution', [
      { periodLabel: '2024-01', cumulativeCount: 10 } as any,
      { periodLabel: '2024-02', cumulativeCount: 25 } as any,
    ]);
    expect(component.installationEvolution().length).toBe(2);
  });
});
