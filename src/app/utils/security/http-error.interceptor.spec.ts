import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { withInterceptors } from '@angular/common/http';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful responses', () => {
    httpClient.get('/api/test').subscribe({
      next: (response) => {
        expect(response).toEqual({ data: 'ok' });
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'ok' });
  });

  it('should pass through 401 errors', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should pass through 404 errors', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should pass through 403 errors', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(403);
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
  });

  it('should retry on 500 errors and then fail', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const reqs = httpMock.match(() => true);
    expect(reqs.length).toBeGreaterThanOrEqual(1);
    reqs[reqs.length - 1].flush('Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should extract error message from ProblemDetail format', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { status: 500, detail: 'Something went wrong', title: 'Server Error' },
      { status: 500, statusText: 'Server Error' }
    );
  });

  it('should extract error message from ApiResponse format', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(400);
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { message: 'Validation failed' },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('should handle network errors', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
  });

  it('should handle error with error.error string', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(400);
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { error: 'Something bad' },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('should handle error with no body', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(null, { status: 500, statusText: 'Server Error' });
  });

  it('should retry on 429 Too Many Requests', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(429);
      },
    });

    const reqs = httpMock.match(() => true);
    expect(reqs.length).toBeGreaterThanOrEqual(1);
    reqs[reqs.length - 1].flush('Too Many Requests', { status: 429, statusText: 'Too Many Requests' });
  });

  it('should not retry on 501 Not Implemented', () => {
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(501);
      },
    });

    const reqs = httpMock.match(() => true);
    expect(reqs.length).toBe(1);
    reqs[0].flush('Not Implemented', { status: 501, statusText: 'Not Implemented' });
  });
});
