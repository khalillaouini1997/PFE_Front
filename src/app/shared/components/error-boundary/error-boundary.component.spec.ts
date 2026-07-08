import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ErrorBoundaryComponent } from './error-boundary.component';
import { Router } from '@angular/router';

describe('ErrorBoundaryComponent', () => {
  let component: ErrorBoundaryComponent;
  let fixture: ComponentFixture<ErrorBoundaryComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ErrorBoundaryComponent],
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorBoundaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content when no error', () => {
    fixture.componentRef.setInput('error', null);
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.error-boundary');
    expect(errorEl).toBeNull();
  });

  it('should show fallback when error is provided', () => {
    fixture.componentRef.setInput('error', new Error('Something broke'));
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.error-boundary');
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toContain('Something went wrong');
  });

  it('should display error message', () => {
    fixture.componentRef.setInput('error', new Error('Network error occurred'));
    fixture.detectChanges();

    const messageEl = fixture.nativeElement.querySelector('.error-message');
    expect(messageEl?.textContent).toContain('Network error occurred');
  });

  it('should emit retry event on retry click', () => {
    const spy = vi.fn();
    component.retry.subscribe(spy);

    fixture.componentRef.setInput('error', new Error('Server error'));
    fixture.detectChanges();

    component.onRetry();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to dashboard on go home', () => {
    fixture.componentRef.setInput('error', new Error('Unknown error'));
    fixture.detectChanges();

    component.onGoHome();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/adminWeb/dashboard']);
  });

  it('should detect network errors', () => {
    fixture.componentRef.setInput('error', new Error('Network connection failed'));
    fixture.detectChanges();

    expect(component.errorContext()?.type).toBe('network');
    expect(component.errorContext()?.retryable).toBe(true);
    expect(component.getIcon()).toBe('wifi_off');
    expect(component.getSeverity()).toBe('warning');
  });

  it('should detect timeout errors', () => {
    fixture.componentRef.setInput('error', new Error('Request timed out'));
    fixture.detectChanges();

    expect(component.errorContext()?.type).toBe('timeout');
    expect(component.errorContext()?.retryable).toBe(true);
    expect(component.getIcon()).toBe('schedule');
  });

  it('should detect server errors', () => {
    fixture.componentRef.setInput('error', new Error('500 Internal Server Error'));
    fixture.detectChanges();

    expect(component.errorContext()?.type).toBe('server');
    expect(component.errorContext()?.retryable).toBe(true);
    expect(component.getIcon()).toBe('error');
    expect(component.getSeverity()).toBe('error');
  });

  it('should detect 404 errors as non-retryable', () => {
    fixture.componentRef.setInput('error', new Error('404 Not Found'));
    fixture.detectChanges();

    expect(component.errorContext()?.type).toBe('client');
    expect(component.errorContext()?.retryable).toBe(false);
    expect(component.getIcon()).toBe('link_off');
    expect(component.getSeverity()).toBe('error');
  });

  it('should default to unknown type for unrecognized errors', () => {
    fixture.componentRef.setInput('error', new Error('Something weird happened'));
    fixture.detectChanges();

    expect(component.errorContext()?.type).toBe('unknown');
    expect(component.errorContext()?.retryable).toBe(true);
    expect(component.getIcon()).toBe('warning');
    expect(component.getSeverity()).toBe('info');
  });

  it('should show details panel when showDetails is true', () => {
    fixture.componentRef.setInput('error', new Error('Test error'));
    fixture.componentRef.setInput('showDetails', true);
    fixture.detectChanges();

    const details = fixture.nativeElement.querySelector('details');
    expect(details).toBeTruthy();
  });

  it('should hide details panel when showDetails is false', () => {
    fixture.componentRef.setInput('error', new Error('Test error'));
    fixture.componentRef.setInput('showDetails', false);
    fixture.detectChanges();

    const details = fixture.nativeElement.querySelector('details');
    expect(details).toBeNull();
  });

  it('should provide suggested action for network errors', () => {
    fixture.componentRef.setInput('error', new Error('fetch failed'));
    fixture.detectChanges();

    expect(component.errorContext()?.suggestedAction).toContain('internet connection');
  });

  it('should provide suggested action for timeout errors', () => {
    fixture.componentRef.setInput('error', new Error('timed out'));
    fixture.detectChanges();

    expect(component.errorContext()?.suggestedAction).toContain('took too long');
  });
});
