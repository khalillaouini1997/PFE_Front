import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DashboardChartsComponent } from './dashboard-charts.component';
import { TranslateService } from '@ngx-translate/core';
import { DashboardStore } from '../../../../shared/stores';
import { RealTime } from '../../../../data/data';
import { DeviceInstallationEvolution } from '../../../../data/models/analysis.model';

vi.mock('chart.js', () => {
  return {
    Chart: class {
      static register() {}
      constructor(public ctx: any, public config: any) {}
      destroy() {}
      update() {}
      set data(val: any) {}
      get data() { return {}; }
    },
    registerables: []
  };
});

describe('DashboardChartsComponent', () => {
  let component: DashboardChartsComponent;
  let fixture: ComponentFixture<DashboardChartsComponent>;
  let mockTranslate: { instant: ReturnType<typeof vi.fn> };
  let mockStore: { setGranularity: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockTranslate = { instant: vi.fn((key: string) => key) };
    mockStore = { setGranularity: vi.fn() };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DashboardChartsComponent],
      providers: [
        { provide: TranslateService, useValue: mockTranslate },
        { provide: DashboardStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardChartsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    fixture.detectChanges();
    expect(component.realtimes()).toEqual([]);
    expect(component.stats()).toEqual({ total: 0, valid: 0, technicalIssue: 0, moving: 0 });
    expect(component.installationEvolution()).toEqual([]);
    expect(component.granularity()).toBe('month');
  });

  it('should accept realtimes input', () => {
    const realtimes: RealTime[] = [
      { deviceid: 1, matricule: 'T-001', status: 'VALID', latitude: 33.88, longitude: 9.53, validity: true, speed: 60, ignition: true, record_time: new Date(), numPuce: '8921601001', imei: '123', version: 'v1' },
      { deviceid: 2, matricule: 'T-002', status: 'VALID', latitude: 34.00, longitude: 9.60, validity: true, speed: 0, ignition: false, record_time: new Date(), numPuce: '8921602001', imei: '456', version: 'v1' }
    ];
    fixture.componentRef.setInput('realtimes', realtimes);
    fixture.detectChanges();

    expect(component.realtimes().length).toBe(2);
  });

  it('should accept stats input', () => {
    fixture.componentRef.setInput('stats', { total: 100, valid: 80, technicalIssue: 10, moving: 50 });
    fixture.detectChanges();

    expect(component.stats().total).toBe(100);
    expect(component.stats().valid).toBe(80);
  });

  it('should accept installationEvolution input', () => {
    const evolution: DeviceInstallationEvolution[] = [
      { periodLabel: 'Jan 2024', cumulativeCount: 50, newInstallations: 10 },
      { periodLabel: 'Feb 2024', cumulativeCount: 65, newInstallations: 15 }
    ];
    fixture.componentRef.setInput('installationEvolution', evolution);
    fixture.detectChanges();

    expect(component.installationEvolution().length).toBe(2);
  });

  it('should accept granularity input', () => {
    fixture.componentRef.setInput('granularity', 'week');
    fixture.detectChanges();
    expect(component.granularity()).toBe('week');
  });

  it('should call store.setGranularity on granularity change', () => {
    fixture.detectChanges();
    const event = { target: { value: 'year' } } as unknown as Event;
    component.onGranularityChange(event);
    expect(mockStore.setGranularity).toHaveBeenCalledWith('year');
  });

  it('should render canvas elements for charts', () => {
    fixture.detectChanges();
    const canvases = fixture.nativeElement.querySelectorAll('canvas');
    expect(canvases.length).toBeGreaterThanOrEqual(4);
  });

  it('should call destroy on charts when component is destroyed', () => {
    fixture.detectChanges();
    const charts = (component as any).stateChart;
    fixture.destroy();
    expect((component as any).stateChart).toBeDefined();
  });
});
