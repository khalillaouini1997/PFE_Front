import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Provider } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { SidebarComponent } from './sidebar.component';
import { AuthService } from 'src/app/service/auth.service';
import { WebSocketService } from 'src/app/service/web-socket.service';

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    })),
  });
}

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authService: { getCurrentUser: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn>; hasRole: ReturnType<typeof vi.fn> };
  let webSocketService: { getNotifications: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let notificationSubject: Subject<any>;

  beforeEach(async () => {
    notificationSubject = new Subject();
    authService = {
      getCurrentUser: vi.fn().mockReturnValue({ username: 'admin', role: 'GLOBALADMINDESC' }),
      logout: vi.fn(),
      hasRole: vi.fn().mockReturnValue(false),
    };
    webSocketService = {
      getNotifications: vi.fn().mockReturnValue(notificationSubject),
    };
    router = { navigate: vi.fn() };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService } as Provider,
        { provide: WebSocketService, useValue: webSocketService } as Provider,
        { provide: Router, useValue: router } as Provider,
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } } as Provider,
      ],
      imports: [SidebarComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
    notificationSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load current user from auth service', () => {
    expect(component.currentUser.username).toBe('admin');
  });

  it('should use createAdministratorCompte when no user', () => {
    authService.getCurrentUser.mockReturnValue(null);
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    expect(component.currentUser).toBeTruthy();
  });

  it('should increment notification count on notification', () => {
    component.ngOnInit();
    expect(component.notificationCount).toBe(0);
    notificationSubject.next({ alert: 'test' });
    expect(component.notificationCount).toBe(1);
    notificationSubject.next({ alert: 'test2' });
    expect(component.notificationCount).toBe(2);
  });

  it('should not increment on null notification', () => {
    component.ngOnInit();
    notificationSubject.next(null);
    expect(component.notificationCount).toBe(0);
  });

  it('should logout and navigate to login', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/authentification']);
  });

  it('should check WEBADMIN role', () => {
    authService.hasRole.mockImplementation((r: string) => r === 'WEBADMIN');
    expect(component.isWebAdminOrGlobal()).toBe(true);
  });

  it('should check GLOBALADMINDESC role', () => {
    authService.hasRole.mockImplementation((r: string) => r === 'GLOBALADMINDESC');
    expect(component.isWebAdminOrGlobal()).toBe(true);
  });

  it('should return false for non-admin role', () => {
    authService.hasRole.mockReturnValue(false);
    expect(component.isWebAdminOrGlobal()).toBe(false);
  });

  it('should check isGlobalAdminDesc', () => {
    authService.hasRole.mockImplementation((r: string) => r === 'GLOBALADMINDESC');
    expect(component.isGlobalAdminDesc()).toBe(true);
    authService.hasRole.mockReturnValue(false);
    expect(component.isGlobalAdminDesc()).toBe(false);
  });

  it('should check isAgent', () => {
    authService.hasRole.mockImplementation((r: string) => r === 'AGENT');
    expect(component.isAgent()).toBe(true);
    authService.hasRole.mockReturnValue(false);
    expect(component.isAgent()).toBe(false);
  });

  it('should check canDelete', () => {
    authService.hasRole.mockImplementation((r: string) => r === 'GLOBALADMINDESC');
    expect(component.canDelete()).toBe(true);
    authService.hasRole.mockReturnValue(false);
    expect(component.canDelete()).toBe(false);
  });

  it('should toggle sidebar collapsed state', () => {
    expect(component.isCollapsed()).toBe(false);
    component.toggleSidebar();
    expect(component.isCollapsed()).toBe(true);
    component.toggleSidebar();
    expect(component.isCollapsed()).toBe(false);
  });

  it('should emit sidebarToggle on toggle', () => {
    const spy = vi.spyOn(component.sidebarToggle, 'emit');
    component.toggleSidebar();
    expect(spy).toHaveBeenCalledWith(true);
    component.toggleSidebar();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should set menu active state', () => {
    component.setMenu('dashboard');
    expect(component.isActiveDashBoard).toBe(true);
    expect(component.isActiveGlobalDashBoard).toBe(false);

    component.setMenu('globalDashboard');
    expect(component.isActiveGlobalDashBoard).toBe(true);
    expect(component.isActiveDashBoard).toBe(false);
  });

  it('should set server menu', () => {
    component.setMenu('addServer');
    expect(component.isActiveServerForm).toBe(true);
    component.setMenu('listServer');
    expect(component.isActiveListServer).toBe(true);
  });

  it('should set web menu', () => {
    component.setMenu('addWeb');
    expect(component.isActiveForm).toBe(true);
    component.setMenu('listWeb');
    expect(component.isActiveListWeb).toBe(true);
  });

  it('should set other menus', () => {
    component.setMenu('logs');
    expect(component.isActiveAccessLog).toBe(true);
    component.setMenu('traccar');
    expect(component.isActiveTraccar).toBe(true);
    component.setMenu('billing');
    expect(component.isActiveBilling).toBe(true);
    component.setMenu('addAdmin');
    expect(component.isActiveAddAdminCompte).toBe(true);
    component.setMenu('listAdmin');
    expect(component.isActiveAdminCompte).toBe(true);
  });

  it('should change language', () => {
    const translate = TestBed.inject(TranslateService);
    component.changeLanguage('en');
    expect(translate.currentLang).toBe('en');
    expect(localStorage.getItem('language')).toBe('en');
  });

  it('should check isLang', () => {
    const translate = TestBed.inject(TranslateService);
    translate.use('fr');
    expect(component.isLang('fr')).toBe(true);
    expect(component.isLang('en')).toBe(false);
  });

  it('should default to fr when no currentLang', () => {
    const translate = TestBed.inject(TranslateService);
    translate.currentLang = undefined as any;
    expect(component.isLang('fr')).toBe(true);
  });
});
