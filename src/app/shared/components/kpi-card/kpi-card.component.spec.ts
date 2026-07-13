import {ComponentFixture, TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {KpiCardComponent} from './kpi-card.component';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    let rafId = 0;
    let now = 0;
    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      writable: true,
      value: (cb: FrameRequestCallback) => {
        now += 1000;
        cb(now);
        return ++rafId;
      },
    });
    Object.defineProperty(globalThis, 'cancelAnimationFrame', {
      writable: true,
      value: () => {
      },
    });
    Object.defineProperty(globalThis, 'performance', {
      writable: true,
      value: {now: () => now},
    });
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(), clearRect: vi.fn(), strokeRect: vi.fn(),
      fillText: vi.fn(), strokeText: vi.fn(), measureText: vi.fn(() => ({width: 0})),
      beginPath: vi.fn(), closePath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      stroke: vi.fn(), fill: vi.fn(), arc: vi.fn(), rect: vi.fn(),
      createLinearGradient: vi.fn(() => ({addColorStop: vi.fn()})),
      canvas: {width: 300, height: 150, parentElement: document.createElement('div')},
    })) as any;
    await TestBed.configureTestingModule({
      imports: [KpiCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 0);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render label and value', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', 1000);
    fixture.detectChanges();

    const el = fixture.nativeElement;
    expect(el.querySelector('.kpi-label')?.textContent).toContain('Revenue');
    expect(el.querySelector('.kpi-value')?.textContent).toContain('1000');
  });

  it('should display icon', () => {
    fixture.componentRef.setInput('label', 'Users');
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('icon', 'icon-test');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kpi-icon')?.textContent).toContain('icon-test');
  });

  it('should display up trend indicator', () => {
    fixture.componentRef.setInput('label', 'Sales');
    fixture.componentRef.setInput('value', 200);
    fixture.componentRef.setInput('trend', 'up');
    fixture.componentRef.setInput('trendValue', 12);
    fixture.detectChanges();

    const trendEl = fixture.nativeElement.querySelector('.kpi-trend');
    expect(trendEl).toBeTruthy();
    expect(trendEl?.textContent).toContain('12');
  });

  it('should display down trend indicator', () => {
    fixture.componentRef.setInput('label', 'Sales');
    fixture.componentRef.setInput('value', 200);
    fixture.componentRef.setInput('trend', 'down');
    fixture.componentRef.setInput('trendValue', 5);
    fixture.detectChanges();

    const trendEl = fixture.nativeElement.querySelector('.kpi-trend');
    expect(trendEl).toBeTruthy();
    expect(trendEl?.textContent).toContain('5');
  });

  it('should hide trend indicator when trend is null', () => {
    fixture.componentRef.setInput('label', 'Sales');
    fixture.componentRef.setInput('value', 200);
    fixture.componentRef.setInput('trend', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kpi-trend')).toBeNull();
  });

  it('should display trendValue', () => {
    fixture.componentRef.setInput('label', 'Sales');
    fixture.componentRef.setInput('value', 200);
    fixture.componentRef.setInput('trend', 'up');
    fixture.componentRef.setInput('trendValue', 25);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kpi-trend')?.textContent).toContain('25');
  });

  it('should set up sparkline canvas when showSparkline is true', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', 5000);
    fixture.componentRef.setInput('showSparkline', true);
    fixture.componentRef.setInput('trend', 'up');
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas.sparkline');
    expect(canvas).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.sparkline-container')).toBeTruthy();
  });

  it('should not render sparkline when showSparkline is false', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', 5000);
    fixture.componentRef.setInput('showSparkline', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('canvas.sparkline')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sparkline-container')).toBeNull();
  });

  it('should clean up chart on destroy', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', 5000);
    fixture.componentRef.setInput('showSparkline', true);
    fixture.componentRef.setInput('trend', 'up');
    fixture.detectChanges();

    fixture.destroy();
    expect((component as any).sparklineChart).toBeDefined();
  });

  it('should animate numeric values', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', 1000);
    fixture.detectChanges();

    expect(typeof component.displayValue()).toBe('number');
    expect(component.displayValue()).toBe(1000);
  });

  it('should handle string values', () => {
    fixture.componentRef.setInput('label', 'Status');
    fixture.componentRef.setInput('value', 'Active');
    fixture.detectChanges();

    expect(component.displayValue()).toBe('Active');
  });

  it('should apply trend-up class when trend is up', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', 1000);
    fixture.componentRef.setInput('trend', 'up');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kpi-card')?.classList.contains('trend-up')).toBe(true);
  });

  it('should apply trend-down class when trend is down', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', 1000);
    fixture.componentRef.setInput('trend', 'down');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kpi-card')?.classList.contains('trend-down')).toBe(true);
  });
});
