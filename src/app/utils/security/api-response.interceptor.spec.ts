import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { withInterceptors } from '@angular/common/http';
import { apiResponseInterceptor } from './api-response.interceptor';

describe('apiResponseInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiResponseInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should unwrap ApiResponse and return only the data', () => {
    httpClient.get('/api/data').subscribe({
      next: (response) => {
        expect(response).toEqual({ name: 'test' });
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.flush({
      success: true,
      data: { name: 'test' },
      message: 'OK',
      timestamp: '2024-01-01',
    });
  });

  it('should pass through responses without ApiResponse wrapper', () => {
    httpClient.get('/api/raw').subscribe({
      next: (response) => {
        expect(response).toEqual({ raw: 'data' });
      },
    });

    const req = httpMock.expectOne('/api/raw');
    req.flush({ raw: 'data' });
  });

  it('should throw error when ApiResponse success is false', () => {
    httpClient.get('/api/data').subscribe({
      error: (error) => {
        expect(error.message).toBe('Request failed');
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.flush({
      success: false,
      data: null,
      message: 'Request failed',
      timestamp: '2024-01-01',
    });
  });

  it('should use error field when message is not available', () => {
    httpClient.get('/api/data').subscribe({
      error: (error) => {
        expect(error.message).toBe('Something went wrong');
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.flush({
      success: false,
      data: null,
      error: 'Something went wrong',
      timestamp: '2024-01-01',
    });
  });

  it('should skip unwrapping for /authenticate endpoint', () => {
    httpClient.get('/authenticate').subscribe({
      next: (response) => {
        expect(response).toEqual({
          success: true,
          data: { token: 'abc' },
          message: 'OK',
          timestamp: '2024-01-01',
        });
      },
    });

    const req = httpMock.expectOne('/authenticate');
    req.flush({
      success: true,
      data: { token: 'abc' },
      message: 'OK',
      timestamp: '2024-01-01',
    });
  });

  it('should skip unwrapping for /refresh endpoint', () => {
    httpClient.get('/refresh').subscribe({
      next: (response) => {
        expect(response).toEqual({
          success: true,
          data: { token: 'new' },
          message: 'OK',
          timestamp: '2024-01-01',
        });
      },
    });

    const req = httpMock.expectOne('/refresh');
    req.flush({
      success: true,
      data: { token: 'new' },
      message: 'OK',
      timestamp: '2024-01-01',
    });
  });

  it('should pass through non-HttpResponse events', () => {
    httpClient.get('/api/data').subscribe({
      next: (response) => {
        expect(response).toBeNull();
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.flush(null);
  });
});
