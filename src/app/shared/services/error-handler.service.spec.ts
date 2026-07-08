import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let router: Router;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        ErrorHandlerService,
      ],
    });
    service = TestBed.inject(ErrorHandlerService);
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleError', () => {
    it('should return an observable that throws the error', () => {
      const error = new Error('test error');
      let caughtError: any;
      service.handleError({ error }).subscribe({
        error: (err) => {
          caughtError = err;
        },
      });
      expect(caughtError).toBe(error);
    });

    it('should add error to errors signal', () => {
      const error = new Error('test');
      service.handleError({ error, component: 'TestComponent' });

      const errors = service.errors$();
      expect(errors.length).toBe(1);
      expect(errors[0].error).toBe(error);
      expect(errors[0].component).toBe('TestComponent');
      expect(errors[0].timestamp).toBeDefined();
    });
  });

  describe('HttpErrorResponse handling', () => {
    it('should categorize network errors (status 0)', () => {
      const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
      service.handleError({ error });

      const errors = service.errors$();
      expect(errors[0].errorType).toBe('network');
    });

    it('should categorize server errors (status 500)', () => {
      const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      service.handleError({ error });

      const errors = service.errors$();
      expect(errors[0].errorType).toBe('network');
    });

    it('should categorize validation errors (status 400)', () => {
      const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
      service.handleError({ error });

      const errors = service.errors$();
      expect(errors[0].errorType).toBe('validation');
    });
  });

  describe('navigation on critical errors', () => {
    it('should navigate to /error on 403', () => {
      const error = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });
      service.handleError({ error, component: 'TestComponent' });

      expect(navigateSpy).toHaveBeenCalledWith(
        ['/error'],
        expect.objectContaining({
          queryParams: expect.objectContaining({
            component: 'TestComponent',
          }),
        })
      );
    });

    it('should navigate to /error on 500', () => {
      const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      service.handleError({ error });

      expect(navigateSpy).toHaveBeenCalledWith(['/error'], expect.any(Object));
    });

    it('should not navigate on 400', () => {
      const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
      service.handleError({ error });

      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should not navigate on 401', () => {
      const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
      service.handleError({ error });

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      service.handleError({ error: new Error('a') });
      service.handleError({ error: new Error('b') });
      expect(service.errors$().length).toBe(2);

      service.clearErrors();
      expect(service.errors$().length).toBe(0);
    });
  });

  describe('getErrorsByType', () => {
    it('should filter errors by type', () => {
      service.handleError({ error: new HttpErrorResponse({ status: 0 }) });
      service.handleError({ error: new Error('test'), errorType: 'business' });

      const networkErrors = service.getErrorsByType('network');
      expect(networkErrors.length).toBe(1);
      expect(networkErrors[0].errorType).toBe('network');
    });
  });

  describe('getRecentErrors', () => {
    it('should return last N errors', () => {
      for (let i = 0; i < 5; i++) {
        service.handleError({ error: new Error(`err${i}`) });
      }

      const recent = service.getRecentErrors(3);
      expect(recent.length).toBe(3);
    });

    it('should return all errors when count exceeds total', () => {
      service.handleError({ error: new Error('a') });
      const recent = service.getRecentErrors(10);
      expect(recent.length).toBe(1);
    });
  });
});
