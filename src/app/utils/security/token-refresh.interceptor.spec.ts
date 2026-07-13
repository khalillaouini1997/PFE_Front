import {TestBed} from '@angular/core/testing';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';
import {tokenRefreshInterceptor} from './token-refresh.interceptor';
import {AuthService} from '../../service/auth.service';

describe('tokenRefreshInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: { refreshToken: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    TestBed.resetTestingModule();
    authService = {refreshToken: vi.fn(), logout: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenRefreshInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    TestBed.overrideProvider(AuthService, {useValue: authService});
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should pass through successful responses', () => {
    httpClient.get('/api/data').subscribe({
      next: (response) => {
        expect(response).toEqual({data: 'ok'});
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.flush({data: 'ok'});
  });

  it('should skip token refresh for auth endpoints', () => {
    httpClient.post('/auth/login', {username: 'test', password: 'test'}).subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('/auth/login');
    req.flush('Unauthorized', {status: 401, statusText: 'Unauthorized'});
    expect(authService.refreshToken).not.toHaveBeenCalled();
  });

  it('should attempt token refresh on 401 for non-auth endpoints', () => {
    authService.refreshToken.mockReturnValue(of({}));

    httpClient.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    req.flush('Unauthorized', {status: 401, statusText: 'Unauthorized'});

    expect(authService.refreshToken).toHaveBeenCalled();

    const retriedReq = httpMock.expectOne('/api/data');
    retriedReq.flush({data: 'ok'});
  });

  it('should retry the original request after successful refresh', () => {
    authService.refreshToken.mockReturnValue(of({}));

    httpClient.get('/api/data').subscribe({
      next: (response) => {
        expect(response).toEqual({data: 'retried'});
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Unauthorized', {status: 401, statusText: 'Unauthorized'});

    const retriedReq = httpMock.expectOne('/api/data');
    retriedReq.flush({data: 'retried'});
  });

  it('should logout and redirect on failed refresh', () => {
    authService.refreshToken.mockReturnValue(throwError(() => ({status: 401})));

    httpClient.get('/api/data').subscribe({
      error: (error) => {
        expect(error.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Unauthorized', {status: 401, statusText: 'Unauthorized'});

    expect(authService.logout).toHaveBeenCalled();
  });

  it('should pass through non-401 errors without attempting refresh', () => {
    httpClient.get('/api/data').subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Server Error', {status: 500, statusText: 'Server Error'});
    expect(authService.refreshToken).not.toHaveBeenCalled();
  });
});
