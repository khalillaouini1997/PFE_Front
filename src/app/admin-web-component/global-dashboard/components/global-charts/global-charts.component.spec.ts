import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalChartsComponent } from './global-charts.component';

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

describe('GlobalChartsComponent', () => {
  let component: GlobalChartsComponent;
  let fixture: ComponentFixture<GlobalChartsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [GlobalChartsComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalChartsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have default empty realtimes input', () => {
    fixture.detectChanges();
    expect(component.realtimes()).toEqual([]);
  });

  it('should have default stats input', () => {
    fixture.detectChanges();
    const stats = component.stats();
    expect(stats.totalVehicles).toBe(0);
    expect(stats.valid).toBe(0);
    expect(stats.technicalIssue).toBe(0);
    expect(stats.nonValid).toBe(0);
  });

  it('should accept realtimes input via setInput', () => {
    const mockData = [
      { speed: 0, numPuce: '8921601234', signal: 20 },
      { speed: 45, numPuce: '8921605678', signal: 15 }
    ];
    fixture.componentRef.setInput('realtimes', mockData);
    fixture.detectChanges();
    expect(component.realtimes().length).toBe(2);
  });

  it('should accept stats input via setInput', () => {
    fixture.componentRef.setInput('stats', {
      totalVehicles: 100,
      valid: 80,
      technicalIssue: 10,
      nonValid: 10,
      moving: 50,
      stopped: 50,
      ignitionOn: 60,
      accountsCount: 5,
      inactive: 5
    });
    fixture.detectChanges();
    expect(component.stats().totalVehicles).toBe(100);
    expect(component.stats().valid).toBe(80);
  });

  it('should compute healthScore correctly', () => {
    fixture.componentRef.setInput('stats', {
      totalVehicles: 100,
      valid: 75,
      technicalIssue: 15,
      nonValid: 10,
      moving: 50,
      stopped: 50,
      ignitionOn: 60,
      accountsCount: 5,
      inactive: 5
    });
    fixture.detectChanges();
    expect(component.healthScore()).toBe(75);
  });

  it('should compute healthScore as 0 when no vehicles', () => {
    fixture.detectChanges();
    expect(component.healthScore()).toBe(0);
  });

  it('should compute healthScore without totalVehicles using sum', () => {
    fixture.componentRef.setInput('stats', {
      totalVehicles: 0,
      valid: 50,
      technicalIssue: 30,
      nonValid: 20,
      moving: 40,
      stopped: 60,
      ignitionOn: 55,
      accountsCount: 3,
      inactive: 0
    });
    fixture.detectChanges();
    expect(component.healthScore()).toBe(50);
  });

  it('should destroy charts on ngOnDestroy', () => {
    fixture.detectChanges();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('updateCharts should return early when no chart refs', () => {
    fixture.detectChanges();
    expect(() => component.updateCharts()).not.toThrow();
  });
});
