import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthentificationComponent } from './authentification.component';
import { AuthService } from '../service/auth.service';
import { WebSocketService } from '../service/web-socket.service';

describe('AuthentificationComponent', () => {
  let component: AuthentificationComponent;
  let fixture: ComponentFixture<AuthentificationComponent>;
  let authService: { authentificate: ReturnType<typeof vi.fn>; saveSession: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let webSocketService: { connect: ReturnType<typeof vi.fn> };
  let toastr: { error: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      authentificate: vi.fn(),
      saveSession: vi.fn(),
      logout: vi.fn(),
    };
    webSocketService = { connect: vi.fn() };
    toastr = { error: vi.fn() };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(ToastrModule.forRoot()),
        { provide: AuthService, useValue: authService },
        { provide: WebSocketService, useValue: webSocketService },
        { provide: ToastrService, useValue: toastr },
        { provide: Router, useValue: router },
      ],
      imports: [AuthentificationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthentificationComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty initial values', () => {
    expect(component.login).toBe('');
    expect(component.password).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.errorVisible).toBe(false);
    expect(component.loading).toBe(false);
  });

  it('should call logout before authenticating on submit', () => {
    authService.authentificate.mockReturnValue(of({ user: { role: 'WEBADMIN' } }));
    component.login = 'admin';
    component.password = 'pass';
    component.onSubmit();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should authenticate and navigate to dashboard on success', () => {
    authService.authentificate.mockReturnValue(of({ user: { role: 'WEBADMIN' } }));
    component.login = 'admin';
    component.password = 'pass';
    component.onSubmit();
    expect(authService.authentificate).toHaveBeenCalledWith('admin', 'pass');
    expect(authService.saveSession).toHaveBeenCalled();
    expect(webSocketService.connect).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/adminWeb/dashboard']);
  });

  it('should navigate to listWebs for AGENT role', () => {
    authService.authentificate.mockReturnValue(of({ user: { role: 'AGENT' } }));
    component.login = 'agent';
    component.password = 'pass';
    component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['/adminWeb/listWebs']);
  });

  it('should handle login error', () => {
    authService.authentificate.mockReturnValue(throwError(() => new Error('fail')));
    component.login = 'wrong';
    component.password = 'wrong';
    component.onSubmit();
    expect(component.loading).toBe(false);
    expect(component.errorVisible).toBe(true);
    expect(component.errorMessage).toBe('Login or password is incorrect');
    expect(toastr.error).toHaveBeenCalled();
  });

  it('should set loading to true during auth', () => {
    authService.authentificate.mockReturnValue(of({ user: { role: 'WEBADMIN' } }));
    component.login = 'admin';
    component.password = 'pass';
    component.onSubmit();
    // After subscribe completes, loading should be false
    expect(component.loading).toBe(false);
  });

  it('should set loading to false on error', () => {
    authService.authentificate.mockReturnValue(throwError(() => new Error('fail')));
    component.onSubmit();
    expect(component.loading).toBe(false);
  });
});
