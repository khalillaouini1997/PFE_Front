import {TestBed} from '@angular/core/testing';
import {provideRouter, Route, Router, UrlSegment, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {roleGuard} from './role.guard';
import {AuthService} from '../service/auth.service';

describe('roleGuard', () => {
  let authService: { getCurrentUser: ReturnType<typeof vi.fn> };
  let router: Router;

  const dummyRoute: Route = {path: ''};
  const dummySegments: UrlSegment[] = [];

  beforeEach(() => {
    authService = {getCurrentUser: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        [provideRouter([])],
      ],
    });
    TestBed.overrideProvider(AuthService, {useValue: authService});
    router = TestBed.inject(Router);
  });

  it('should allow access when user role matches allowed roles', () => {
    authService.getCurrentUser.mockReturnValue({user: {role: 'GLOBALADMINDESC'}});
    const guard = roleGuard(['GLOBALADMINDESC', 'WEBADMIN']);

    TestBed.runInInjectionContext(() => {
      (guard(dummyRoute, dummySegments) as Observable<boolean | UrlTree>).subscribe(result => {
        expect(result).toBe(true);
      });
    });
  });

  it('should redirect to /adminWeb/dashboard when user role does not match', () => {
    authService.getCurrentUser.mockReturnValue({user: {role: 'USER'}});
    const guard = roleGuard(['GLOBALADMINDESC']);

    TestBed.runInInjectionContext(() => {
      (guard(dummyRoute, dummySegments) as Observable<boolean | UrlTree>).subscribe(result => {
        expect(result).toEqual(router.parseUrl('/adminWeb/dashboard'));
      });
    });
  });

  it('should redirect when user is null', () => {
    authService.getCurrentUser.mockReturnValue(null);
    const guard = roleGuard(['GLOBALADMINDESC']);

    TestBed.runInInjectionContext(() => {
      (guard(dummyRoute, dummySegments) as Observable<boolean | UrlTree>).subscribe(result => {
        expect(result).toEqual(router.parseUrl('/adminWeb/dashboard'));
      });
    });
  });

  it('should redirect when user has no role', () => {
    authService.getCurrentUser.mockReturnValue({user: {}});
    const guard = roleGuard(['GLOBALADMINDESC']);

    TestBed.runInInjectionContext(() => {
      (guard(dummyRoute, dummySegments) as Observable<boolean | UrlTree>).subscribe(result => {
        expect(result).toEqual(router.parseUrl('/adminWeb/dashboard'));
      });
    });
  });
});
