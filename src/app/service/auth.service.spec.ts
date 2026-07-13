import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {AuthService} from './auth.service';
import {WebSocketService} from './web-socket.service';
import {STORAGE_KEYS} from '../shared/constants';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const mockWebSocketService = {disconnect: vi.fn()};

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: WebSocketService, useValue: mockWebSocketService},
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
    service.currentUser = null;
  });

  afterEach(() => {
    httpMock.match(() => true);
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('authentificate', () => {
    it('should POST to authenticate with username and password', () => {
      const mockResponse = {user: {username: 'admin'}, token: 'abc'};
      service.authentificate('admin', 'pass123').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(r => r.url.includes('authenticate'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({username: 'admin', password: 'pass123'});
      req.flush(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('should POST to refresh endpoint', () => {
      const mockResponse = {token: 'new-token'};
      service.refreshToken().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(r => r.url.includes('refresh'));
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('saveSession', () => {
    it('should store authResponse in localStorage and set currentUser', () => {
      const authResponse = {user: {username: 'admin'}, token: 'abc'};
      service.saveSession(authResponse);

      expect(localStorage.getItem(STORAGE_KEYS.USER)).toBe(JSON.stringify(authResponse));
      expect(localStorage.getItem(STORAGE_KEYS.AUTH_STATUS)).toBe('true');
      expect(service.currentUser).toEqual(authResponse);
    });
  });

  describe('logout', () => {
    it('should clear localStorage, cookie, currentUser and disconnect websocket', () => {
      localStorage.setItem(STORAGE_KEYS.USER, '{"user":{"username":"admin"}}');
      localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'true');
      service.currentUser = {user: {username: 'admin'}} as any;

      const cookieSpy = vi.spyOn(document, 'cookie', 'set');

      service.logout();

      expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.AUTH_STATUS)).toBeNull();
      expect(service.currentUser).toBeNull();
      expect(mockWebSocketService.disconnect).toHaveBeenCalled();
      expect(cookieSpy).toHaveBeenCalledWith('jwt_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict');
    });
  });

  describe('checkAuth', () => {
    it('should return true and store user when response has user', () => {
      const mockResponse = {user: {username: 'admin'}};
      service.checkAuth().subscribe(result => {
        expect(result).toBe(true);
        expect(service.currentUser).toEqual(mockResponse);
        expect(localStorage.getItem(STORAGE_KEYS.AUTH_STATUS)).toBe('true');
      });

      const req = httpMock.expectOne(r => r.url.includes('auth/me'));
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return false when response has no user', () => {
      service.checkAuth().subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(r => r.url.includes('auth/me'));
      req.flush({noUser: true});
    });

    it('should call logout and return false on error', () => {
      service.checkAuth().subscribe(result => {
        expect(result).toBe(false);
        expect(mockWebSocketService.disconnect).toHaveBeenCalled();
      });

      const req = httpMock.expectOne(r => r.url.includes('auth/me'));
      req.flush('error', {status: 401, statusText: 'Unauthorized'});
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when AUTH_STATUS is true', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'true');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when AUTH_STATUS is not true', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return currentUser if set', () => {
      const user = {user: {username: 'admin'}};
      service.currentUser = user as any;
      expect(service.getCurrentUser()).toEqual(user);
    });

    it('should parse from localStorage when currentUser is null', () => {
      const user = {user: {username: 'admin'}};
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      expect(service.getCurrentUser()).toEqual(user);
      expect(service.currentUser).toEqual(user);
    });

    it('should return null if no user in memory or localStorage', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('getCurrentUserName', () => {
    it('should return username from currentUser', () => {
      service.currentUser = {user: {username: 'admin'}} as any;
      expect(service.getCurrentUserName()).toBe('admin');
    });

    it('should return null when no user', () => {
      expect(service.getCurrentUserName()).toBeNull();
    });
  });

  describe('isAgentAdmin', () => {
    it('should return true for GLOBALADMINDESC role', () => {
      service.currentUser = {user: {role: 'GLOBALADMINDESC'}} as any;
      expect(service.isAgentAdmin()).toBe(true);
    });

    it('should return true for WEBADMIN role', () => {
      service.currentUser = {user: {role: 'WEBADMIN'}} as any;
      expect(service.isAgentAdmin()).toBe(true);
    });

    it('should return false for other roles', () => {
      service.currentUser = {user: {role: 'USER'}} as any;
      expect(service.isAgentAdmin()).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the specified role', () => {
      service.currentUser = {user: {role: 'WEBADMIN'}} as any;
      expect(service.hasRole('WEBADMIN')).toBe(true);
    });

    it('should return false when user does not have the specified role', () => {
      service.currentUser = {user: {role: 'USER'}} as any;
      expect(service.hasRole('WEBADMIN')).toBe(false);
    });

    it('should return false when no user', () => {
      expect(service.hasRole('WEBADMIN')).toBe(false);
    });
  });
});
