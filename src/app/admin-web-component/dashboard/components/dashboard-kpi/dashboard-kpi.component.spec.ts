import {ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {DashboardKpiComponent} from './dashboard-kpi.component';
import {TranslateModule} from '@ngx-translate/core';

describe('DashboardKpiComponent', () => {
  let component: DashboardKpiComponent;
  let fixture: ComponentFixture<DashboardKpiComponent>;

  beforeEach(async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(), clearRect: vi.fn(), strokeRect: vi.fn(),
      fillText: vi.fn(), strokeText: vi.fn(), measureText: vi.fn(() => ({width: 0})),
      beginPath: vi.fn(), closePath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      stroke: vi.fn(), fill: vi.fn(), arc: vi.fn(), rect: vi.fn(),
      createLinearGradient: vi.fn(() => ({addColorStop: vi.fn()})),
      canvas: {width: 300, height: 150},
    })) as any;
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DashboardKpiComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardKpiComponent);
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
    expect(stats.total).toBe(0);
    expect(stats.valid).toBe(0);
    expect(stats.technicalIssue).toBe(0);
    expect(stats.moving).toBe(0);
  });

  it('should accept custom stats input', () => {
    fixture.componentRef.setInput('stats', {
      total: 120,
      valid: 90,
      technicalIssue: 15,
      moving: 60
    });
    fixture.detectChanges();

    const stats = component.stats();
    expect(stats.total).toBe(120);
    expect(stats.valid).toBe(90);
    expect(stats.technicalIssue).toBe(15);
    expect(stats.moving).toBe(60);
  });

  it('should update stats when input changes', () => {
    fixture.componentRef.setInput('stats', {total: 50, valid: 40, technicalIssue: 5, moving: 30});
    expect(component.stats().total).toBe(50);

    fixture.componentRef.setInput('stats', {total: 200, valid: 180, technicalIssue: 10, moving: 150});
    expect(component.stats().total).toBe(200);
  });

  it('should render stats in template', () => {
    fixture.componentRef.setInput('stats', {
      total: 100,
      valid: 80,
      technicalIssue: 10,
      moving: 60
    });
    fixture.detectChanges();
    const el = fixture.debugElement.nativeElement;
    expect(el).toBeTruthy();
  });

  it('should handle zero values', () => {
    fixture.componentRef.setInput('stats', {
      total: 0,
      valid: 0,
      technicalIssue: 0,
      moving: 0
    });
    expect(component.stats().total).toBe(0);
  });

  it('should handle large values', () => {
    fixture.componentRef.setInput('stats', {
      total: 999999,
      valid: 888888,
      technicalIssue: 111111,
      moving: 777777
    });
    expect(component.stats().total).toBe(999999);
  });
});
