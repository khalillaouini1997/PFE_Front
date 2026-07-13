import {ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {TranslateModule} from '@ngx-translate/core';
import {GlobalChartsComponent} from './global-charts.component';

describe('GlobalChartsComponent', () => {
  let component: GlobalChartsComponent;
  let fixture: ComponentFixture<GlobalChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalChartsComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalChartsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty realtimes input', () => {
    expect(component.realtimes()).toEqual([]);
  });

  it('should have default stats input', () => {
    const stats = component.stats();
    expect(stats.totalVehicles).toBe(0);
    expect(stats.valid).toBe(0);
    expect(stats.technicalIssue).toBe(0);
    expect(stats.nonValid).toBe(0);
  });

  it('should accept realtimes input via setInput', () => {
    const mockData = [
      {speed: 0, numPuce: '8921601234', signal: 20},
      {speed: 45, numPuce: '8921605678', signal: 15}
    ];
    fixture.componentRef.setInput('realtimes', mockData);
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
    expect(component.healthScore()).toBe(75);
  });

  it('should compute healthScore as 0 when no vehicles', () => {
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
    expect(component.healthScore()).toBe(50);
  });

  it('should destroy charts on ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('updateCharts should return early when no chart refs', () => {
    expect(() => component.updateCharts()).not.toThrow();
  });
});
