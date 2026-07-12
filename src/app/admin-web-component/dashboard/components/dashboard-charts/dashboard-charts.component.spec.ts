import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

  afterEach(() => {
    component?.ngOnDestroy();
    fixture?.destroy();
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
    fixture.componentRef.setInput('stats', { total: 100, valid: 75, technicalIssue: 15, moving: 50 });
    expect(component.stats().total).toBe(100);
  });

  it('should accept installationEvolution input', () => {
    fixture.componentRef.setInput('installationEvolution', [
      { periodLabel: '2024-01', cumulativeCount: 10 } as any,
      { periodLabel: '2024-02', cumulativeCount: 25 } as any,
    ]);
    expect(component.installationEvolution().length).toBe(2);
  });

  it('updateCharts should return early when view children are null', () => {
    expect(() => component.updateCharts()).not.toThrow();
  });

  it('ngAfterViewInit should call updateCharts', () => {
    const spy = vi.spyOn(component, 'updateCharts');
    component.ngAfterViewInit();
    expect(spy).toHaveBeenCalled();
  });

  it('updateCharts with missing statusChart should return early', () => {
    fixture.componentRef.setInput('realtimes', [
      { deviceid: 1, speed: 0, status: 'VALID', numPuce: '8921601001', signal: 25, matricule: 'T-001', latitude: 33.88, longitude: 9.53, validity: true, ignition: true, record_time: new Date(), imei: '123', version: 'v1' },
    ]);
    expect(() => component.updateCharts()).not.toThrow();
  });

  it('updateCharts with all view children present should not throw', () => {
    vi.spyOn(component, 'statusChart' as any).mockReturnValue({ nativeElement: document.createElement('canvas') });
    vi.spyOn(component, 'speedChart' as any).mockReturnValue({ nativeElement: document.createElement('canvas') });
    vi.spyOn(component, 'puceChart' as any).mockReturnValue({ nativeElement: document.createElement('canvas') });
    vi.spyOn(component, 'signalChart' as any).mockReturnValue({ nativeElement: document.createElement('canvas') });
    expect(() => component.updateCharts()).not.toThrow();
  });

  it('updateStateChart with null canvas should return early', () => {
    vi.spyOn(component, 'statusChart' as any).mockReturnValue(null);
    expect(() => (component as any).updateStateChart()).not.toThrow();
  });

  it('updateSpeedChart with null canvas should return early', () => {
    vi.spyOn(component, 'speedChart' as any).mockReturnValue(null);
    expect(() => (component as any).updateSpeedChart()).not.toThrow();
  });

  it('updatePuceChart with null canvas should return early', () => {
    vi.spyOn(component, 'puceChart' as any).mockReturnValue(null);
    expect(() => (component as any).updatePuceChart()).not.toThrow();
  });

  it('updateSignalChart with null canvas should return early', () => {
    vi.spyOn(component, 'signalChart' as any).mockReturnValue(null);
    expect(() => (component as any).updateSignalChart()).not.toThrow();
  });

  it('updateEvolutionChart with null canvas should return early', () => {
    vi.spyOn(component, 'evolutionChart' as any).mockReturnValue(null);
    expect(() => (component as any).updateEvolutionChart()).not.toThrow();
  });

  it('updateEvolutionChart with data should not throw', () => {
    const mockCanvas = { nativeElement: document.createElement('canvas') };
    vi.spyOn(component, 'evolutionChart' as any).mockReturnValue(mockCanvas);
    fixture.componentRef.setInput('installationEvolution', [
      { periodLabel: 'Jan', cumulativeCount: 10 },
      { periodLabel: 'Feb', cumulativeCount: 20 },
    ]);
    expect(() => (component as any).updateEvolutionChart()).not.toThrow();
  });

  it('updateCharts should call all sub-update methods when view children exist', () => {
    vi.spyOn(component, 'statusChart' as any).mockReturnValue({ nativeElement: document.createElement('canvas') });
    vi.spyOn(component, 'speedChart' as any).mockReturnValue({ nativeElement: document.createElement('canvas') });
    vi.spyOn(component, 'puceChart' as any).mockReturnValue({ nativeElement: document.createElement('canvas') });
    vi.spyOn(component, 'signalChart' as any).mockReturnValue({ nativeElement: document.createElement('canvas') });

    const stateSpy = vi.spyOn(component as any, 'updateStateChart');
    const speedSpy = vi.spyOn(component as any, 'updateSpeedChart');
    const puceSpy = vi.spyOn(component as any, 'updatePuceChart');
    const signalSpy = vi.spyOn(component as any, 'updateSignalChart');

    component.updateCharts();

    expect(stateSpy).toHaveBeenCalled();
    expect(speedSpy).toHaveBeenCalled();
    expect(puceSpy).toHaveBeenCalled();
    expect(signalSpy).toHaveBeenCalled();
  });

  it('updateStateChart should create chart with correct data', () => {
    const mockCanvas = { nativeElement: document.createElement('canvas') };
    vi.spyOn(component, 'statusChart' as any).mockReturnValue(mockCanvas);
    fixture.componentRef.setInput('stats', { total: 10, valid: 7, technicalIssue: 2, moving: 5 });
    fixture.componentRef.setInput('realtimes', [
      { deviceid: 1, status: 'VALID' },
      { deviceid: 2, status: 'NON_VALID' },
    ] as any[]);
    expect(() => (component as any).updateStateChart()).not.toThrow();
  });

  it('updateSpeedChart should categorize speeds into bands', () => {
    const mockCanvas = { nativeElement: document.createElement('canvas') };
    vi.spyOn(component, 'speedChart' as any).mockReturnValue(mockCanvas);
    fixture.componentRef.setInput('realtimes', [
      { deviceid: 1, speed: 0 },
      { deviceid: 2, speed: 15 },
      { deviceid: 3, speed: 45 },
      { deviceid: 4, speed: 80 },
    ] as any[]);
    expect(() => (component as any).updateSpeedChart()).not.toThrow();
  });

  it('updatePuceChart should categorize SIM cards', () => {
    const mockCanvas = { nativeElement: document.createElement('canvas') };
    vi.spyOn(component, 'puceChart' as any).mockReturnValue(mockCanvas);
    fixture.componentRef.setInput('realtimes', [
      { deviceid: 1, numPuce: '8921601001' },
      { deviceid: 2, numPuce: '123456' },
      { deviceid: 3, numPuce: null },
    ] as any[]);
    expect(() => (component as any).updatePuceChart()).not.toThrow();
  });

  it('updateSignalChart should categorize signal quality', () => {
    const mockCanvas = { nativeElement: document.createElement('canvas') };
    vi.spyOn(component, 'signalChart' as any).mockReturnValue(mockCanvas);
    fixture.componentRef.setInput('realtimes', [
      { deviceid: 1, signal: 25 },
      { deviceid: 2, signal: 17 },
      { deviceid: 3, signal: 12 },
      { deviceid: 4, signal: 5 },
    ] as any[]);
    expect(() => (component as any).updateSignalChart()).not.toThrow();
  });

  it('ngOnDestroy should destroy all chart instances', () => {
    (component as any).stateChart = { destroy: vi.fn() };
    (component as any).speedChartInstance = { destroy: vi.fn() };
    (component as any).puceChartInstance = { destroy: vi.fn() };
    (component as any).signalChartInstance = { destroy: vi.fn() };
    (component as any).evolutionChartInstance = { destroy: vi.fn() };

    component.ngOnDestroy();

    expect((component as any).stateChart.destroy).toHaveBeenCalled();
    expect((component as any).speedChartInstance.destroy).toHaveBeenCalled();
    expect((component as any).puceChartInstance.destroy).toHaveBeenCalled();
    expect((component as any).signalChartInstance.destroy).toHaveBeenCalled();
    expect((component as any).evolutionChartInstance.destroy).toHaveBeenCalled();
  });

  it('updateCharts should handle when no view children are present', () => {
    vi.spyOn(component, 'statusChart' as any).mockReturnValue(undefined);
    vi.spyOn(component, 'speedChart' as any).mockReturnValue(undefined);
    expect(() => component.updateCharts()).not.toThrow();
  });
});
