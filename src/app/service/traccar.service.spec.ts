import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {vi} from 'vitest';
import {TraccarService} from './traccar.service';
import {AuthService} from './auth.service';
import {environment} from '../../environments/environment';

describe('TraccarService', () => {
  let service: TraccarService;
  let httpMock: HttpTestingController;
  let authServiceMock: { getCurrentUser: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      getCurrentUser: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TraccarService,
        {provide: AuthService, useValue: authServiceMock},
      ],
    });

    service = TestBed.inject(TraccarService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLisTraccar', () => {
    it('should make GET request to traccar endpoint with idTraccar', () => {
      const idTraccar = 42;
      authServiceMock.getCurrentUser.mockReturnValue({
        user: {idTraccar},
      });

      service.getLisTraccar().subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}traccar/${idTraccar}`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should use 0 when idTraccar is not present', () => {
      authServiceMock.getCurrentUser.mockReturnValue({user: {}});

      service.getLisTraccar().subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}traccar/0`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should use 0 when getCurrentUser returns null', () => {
      authServiceMock.getCurrentUser.mockReturnValue(null);

      service.getLisTraccar().subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}traccar/0`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should append keyword query param when provided', () => {
      const idTraccar = 5;
      const keyword = 'test-keyword';
      authServiceMock.getCurrentUser.mockReturnValue({
        user: {idTraccar},
      });

      service.getLisTraccar(keyword).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}traccar/${idTraccar}?keyword=${encodeURIComponent(keyword)}`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should not append keyword query param when empty', () => {
      const idTraccar = 5;
      authServiceMock.getCurrentUser.mockReturnValue({
        user: {idTraccar},
      });

      service.getLisTraccar('').subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}traccar/${idTraccar}`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should encode keyword with special characters', () => {
      const idTraccar = 10;
      const keyword = 'hello world & more';
      authServiceMock.getCurrentUser.mockReturnValue({
        user: {idTraccar},
      });

      service.getLisTraccar(keyword).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}traccar/${idTraccar}?keyword=${encodeURIComponent(keyword)}`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });
});
