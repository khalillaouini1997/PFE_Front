import {ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ErrorBannerComponent, ErrorBannerData} from './error-banner.component';
import {Router} from '@angular/router';

describe('ErrorBannerComponent', () => {
  let component: ErrorBannerComponent;
  let fixture: ComponentFixture<ErrorBannerComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    routerMock = {navigate: vi.fn()};

    await TestBed.configureTestingModule({
      imports: [ErrorBannerComponent],
      providers: [
        {provide: Router, useValue: routerMock}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show banner when data is provided', () => {
    const errorData: ErrorBannerData = {
      type: 'network',
      message: 'Connection failed'
    };

    component.showError(errorData);
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeTruthy();
    expect(banner?.textContent).toContain('Connection failed');
  });

  it('should hide banner when no data', () => {
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeNull();
  });

  it('should hide banner after calling dismiss', () => {
    component.showError({type: 'server', message: 'Server error'});
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error-banner')).toBeTruthy();

    component.dismiss();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error-banner')).toBeNull();
  });

  it('should emit dismiss event via dismiss()', () => {
    component.showError({type: 'data-fetch', message: 'Fetch failed'});
    fixture.detectChanges();

    component.dismiss();
    fixture.detectChanges();

    expect(component.error()).toBeNull();
  });

  it('should call retryAction on retry', () => {
    const retryFn = vi.fn();
    component.showError({
      type: 'network',
      message: 'Timeout',
      retryAction: retryFn
    });
    fixture.detectChanges();

    component.onRetry();

    expect(retryFn).toHaveBeenCalled();
    expect(component.error()).toBeNull();
  });

  it('should apply error severity class for server errors', () => {
    component.showError({type: 'server', message: 'Internal error'});
    fixture.detectChanges();

    expect(component.getSeverity()).toBe('error');
  });

  it('should apply warning severity class for network errors', () => {
    component.showError({type: 'network', message: 'No connection'});
    fixture.detectChanges();

    expect(component.getSeverity()).toBe('warning');
  });

  it('should return correct icon for each error type', () => {
    component.showError({type: 'network', message: 'fail'});
    expect(component.getIcon()).toBe('wifi_off');

    component.showError({type: 'server', message: 'fail'});
    expect(component.getIcon()).toBe('error');

    component.showError({type: 'map-tile', message: 'fail'});
    expect(component.getIcon()).toBe('map');

    component.showError({type: 'data-fetch', message: 'fail'});
    expect(component.getIcon()).toBe('cloud_off');

    component.showError({type: 'timeout', message: 'fail'});
    expect(component.getIcon()).toBe('schedule');
  });

  it('should dismiss on Escape keydown', () => {
    component.showError({type: 'network', message: 'fail'});
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.error-banner');
    const event = new KeyboardEvent('keydown', {key: 'Escape'});
    banner.dispatchEvent(event);

    expect(component.error()).toBeNull();
  });

  it('should retry on Enter keydown', () => {
    const retryFn = vi.fn();
    component.showError({type: 'network', message: 'fail', retryAction: retryFn});
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.error-banner');
    const event = new KeyboardEvent('keydown', {key: 'Enter'});
    banner.dispatchEvent(event);

    expect(retryFn).toHaveBeenCalled();
  });

  it('should clean up timer on destroy', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    component.showError({type: 'network', message: 'fail'});

    fixture.destroy();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
