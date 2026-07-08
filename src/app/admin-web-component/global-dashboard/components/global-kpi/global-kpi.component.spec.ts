import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GlobalKpiComponent } from './global-kpi.component';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalDashboardStats } from '../../../../shared/stores/global-dashboard.store';

describe('GlobalKpiComponent', () => {
  let component: GlobalKpiComponent;
  let fixture: ComponentFixture<GlobalKpiComponent>;

  beforeEach(async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(), clearRect: vi.fn(), strokeRect: vi.fn(),
      fillText: vi.fn(), strokeText: vi.fn(), measureText: vi.fn(() => ({ width: 0 })),
      beginPath: vi.fn(), closePath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      stroke: vi.fn(), fill: vi.fn(), arc: vi.fn(), rect: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      canvas: { width: 300, height: 150 },
    })) as any;
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [GlobalKpiComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalKpiComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have default stats with zero values', () => {
    fixture.detectChanges();
    const stats = component.stats();
    expect(stats.totalVehicles).toBe(0);
    expect(stats.valid).toBe(0);
    expect(stats.technicalIssue).toBe(0);
    expect(stats.nonValid).toBe(0);
    expect(stats.moving).toBe(0);
    expect(stats.stopped).toBe(0);
    expect(stats.ignitionOn).toBe(0);
    expect(stats.accountsCount).toBe(0);
    expect(stats.inactive).toBe(0);
  });

  it('should accept custom stats input', () => {
    const customStats: GlobalDashboardStats = {
      totalVehicles: 150,
      valid: 100,
      technicalIssue: 20,
      nonValid: 30,
      moving: 80,
      stopped: 70,
      ignitionOn: 60,
      accountsCount: 5,
      inactive: 2
    };
    fixture.componentRef.setInput('stats', customStats);
    fixture.detectChanges();

    expect(component.stats()).toEqual(customStats);
  });

  it('should update stats when input changes', () => {
    fixture.componentRef.setInput('stats', { totalVehicles: 50, valid: 40, technicalIssue: 5, nonValid: 5, moving: 30, stopped: 20, ignitionOn: 15, accountsCount: 3, inactive: 1 });
    fixture.detectChanges();
    expect(component.stats().totalVehicles).toBe(50);

    fixture.componentRef.setInput('stats', { totalVehicles: 200, valid: 180, technicalIssue: 10, nonValid: 10, moving: 150, stopped: 50, ignitionOn: 40, accountsCount: 8, inactive: 0 });
    fixture.detectChanges();
    expect(component.stats().totalVehicles).toBe(200);
  });
});
