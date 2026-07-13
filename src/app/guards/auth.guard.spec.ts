import {TestBed} from '@angular/core/testing';
import {provideRouter, Route, Router, UrlSegment, UrlTree} from '@angular/router';
import {Observable, of, throwError} from 'rxjs';
import {authGuard} from './auth.guard';
import {AuthService} from '../service/auth.service';

describe('authGuard', () => {
  let authService: { checkAuth: ReturnType<typeof vi.fn> };
  let router: Router;

  const dummyRoute: Route = {path: ''};
  const dummySegments: UrlSegment[] = [];

  beforeEach(() => {
    authService = {checkAuth: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        [provideRouter([])],
      ],
    });
    TestBed.overrideProvider(AuthService, {useValue: authService});
    router = TestBed.inject(Router);
  });

  it('should return true when checkAuth returns true', () => {
    authService.checkAuth.mockReturnValue(of(true));

    TestBed.runInInjectionContext(() => {
      (authGuard(dummyRoute, dummySegments) as Observable<boolean | UrlTree>).subscribe(result => {
        expect(result).toBe(true);
      });
    });
  });

  it('should redirect to /authentification when checkAuth returns false', () => {
    authService.checkAuth.mockReturnValue(of(false));

    TestBed.runInInjectionContext(() => {
      (authGuard(dummyRoute, dummySegments) as Observable<boolean | UrlTree>).subscribe(result => {
        expect(result).toEqual(router.parseUrl('/authentification'));
      });
    });
  });

  it('should redirect to /authentification when checkAuth throws an error', () => {
    authService.checkAuth.mockReturnValue(throwError(() => new Error('auth failed')));

    TestBed.runInInjectionContext(() => {
      (authGuard(dummyRoute, dummySegments) as Observable<boolean | UrlTree>).subscribe(result => {
        expect(result).toEqual(router.parseUrl('/authentification'));
      });
    });
  });
});
