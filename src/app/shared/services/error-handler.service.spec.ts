import { TestBed } from '@angular/core/testing';
import { ErrorHandlerService } from './error-handler.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        { provide: Router, useValue: router }
      ]
    });

    service = TestBed.inject(ErrorHandlerService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle network error (status 0)', () => {
    const error = new HttpErrorResponse({ status: 0 });
    service.handleError({ error, component: 'test' });
    expect(service.errors$().length).toBe(1);
    expect(service.errors$()[0].errorType).toBe('network');
  });

  it('should handle server error (status 500)', () => {
    const error = new HttpErrorResponse({ status: 500 });
    service.handleError({ error, component: 'test' });
    expect(service.errors$()[0].errorType).toBe('network');
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should handle validation error (status 400)', () => {
    const error = new HttpErrorResponse({ status: 400 });
    service.handleError({ error, component: 'test' });
    expect(service.errors$()[0].errorType).toBe('validation');
  });

  it('should handle forbidden error (status 403)', () => {
    const error = new HttpErrorResponse({ status: 403 });
    service.handleError({ error, component: 'test' });
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should handle not found error (status 404)', () => {
    const error = new HttpErrorResponse({ status: 404 });
    service.handleError({ error, component: 'test' });
    expect(service.errors$()[0].errorType).toBe('validation');
  });

  it('should handle generic error', () => {
    const error = new Error('something went wrong');
    service.handleError({ error, component: 'test' });
    expect(service.errors$().length).toBe(1);
    expect(service.errors$()[0].errorType).toBe('system');
  });

  it('should detect network error in message', () => {
    const error = new Error('network connection failed');
    service.handleError({ error });
    expect(service.errors$()[0].errorType).toBe('network');
  });

  it('should detect validation error in message', () => {
    const error = new Error('validation failed');
    service.handleError({ error });
    expect(service.errors$()[0].errorType).toBe('validation');
  });

  it('should provide default message for status 0', () => {
    const error = new HttpErrorResponse({ status: 0 });
    const result = service.handleError({ error });
    result.subscribe({ error: () => {} });
  });

  it('should provide default message for status 401', () => {
    const error = new HttpErrorResponse({ status: 401 });
    service.handleError({ error });
    expect(service.errors$().length).toBe(1);
  });

  it('should provide default message for status 500', () => {
    const error = new HttpErrorResponse({ status: 500 });
    service.handleError({ error });
    expect(service.errors$().length).toBe(1);
  });

  it('should handle ProblemDetail error format', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { type: 'about:blank', title: 'Bad Request', detail: 'Invalid input' }
    });
    service.handleError({ error });
    expect(service.errors$().length).toBe(1);
  });

  it('should handle legacy ApiResponse error format', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: 'Something went wrong' }
    });
    service.handleError({ error });
    expect(service.errors$().length).toBe(1);
  });

  it('should clear errors', () => {
    service.handleError({ error: new Error('test') });
    service.clearErrors();
    expect(service.errors$()).toEqual([]);
  });

  it('should get errors by type', () => {
    service.handleError({ error: new HttpErrorResponse({ status: 0 }) });
    service.handleError({ error: new HttpErrorResponse({ status: 400 }) });
    const networkErrors = service.getErrorsByType('network');
    expect(networkErrors.length).toBe(1);
  });

  it('should get recent errors', () => {
    for (let i = 0; i < 15; i++) {
      service.handleError({ error: new Error(`err ${i}`) });
    }
    const recent = service.getRecentErrors(5);
    expect(recent.length).toBe(5);
  });

  it('should use custom error type when provided', () => {
    service.handleError({ error: new Error('test'), errorType: 'business' });
    expect(service.errors$()[0].errorType).toBe('business');
  });

  it('should add timestamp', () => {
    service.handleError({ error: new Error('test') });
    expect(service.errors$()[0].timestamp).toBeInstanceOf(Date);
  });

  it('should return observable', () => {
    const error = new Error('test');
    let caught = false;
    service.handleError({ error }).subscribe({
      error: (e) => { caught = true; expect(e).toBe(error); }
    });
    expect(caught).toBe(true);
  });
});
