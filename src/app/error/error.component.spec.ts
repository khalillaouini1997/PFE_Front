import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let queryParams$: BehaviorSubject<Record<string, string>>;

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject<Record<string, string>>({});
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ErrorComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParams$.asObservable()
          }
        },
        {
          provide: Router,
          useValue: mockRouter
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render error code from query params', () => {
    queryParams$.next({ code: '404' });
    fixture.detectChanges();
    expect(component.errorCode).toBe(404);
  });

  it('should render error message from query params', () => {
    queryParams$.next({ message: 'Something went wrong' });
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Something went wrong');
  });

  it('should set component from query params', () => {
    queryParams$.next({ component: 'Dashboard' });
    fixture.detectChanges();
    expect(component.component).toBe('Dashboard');
  });

  it('should show default message for 401', () => {
    queryParams$.next({ code: '401' });
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Session expired. Please login again.');
  });

  it('should show default message for 403', () => {
    queryParams$.next({ code: '403' });
    fixture.detectChanges();
    expect(component.errorMessage).toBe("Access denied. You don't have permission to access this resource.");
  });

  it('should show default message for 404', () => {
    queryParams$.next({ code: '404' });
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Resource not found.');
  });

  it('should show default message for 500', () => {
    queryParams$.next({ code: '500' });
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Server error. Please try again later.');
  });

  it('should show generic default message for unknown codes', () => {
    queryParams$.next({ code: '999' });
    fixture.detectChanges();
    expect(component.errorMessage).toBe('An unexpected error occurred.');
  });

  it('should use custom message over default when provided', () => {
    queryParams$.next({ code: '404', message: 'Page not available' });
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Page not available');
  });

  it('should set errorCode to null when no code param', () => {
    queryParams$.next({});
    fixture.detectChanges();
    expect(component.errorCode).toBeNull();
  });

  it('goHome() should navigate to /adminWeb/dashboard', () => {
    fixture.detectChanges();
    component.goHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/adminWeb/dashboard']);
  });

  it('goBack() should navigate to /authentification', () => {
    fixture.detectChanges();
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/authentification']);
  });
});
