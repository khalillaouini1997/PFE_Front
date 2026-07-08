import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComptesWebComponentComponent } from './comptes-web-component.component';
import { WebAccountService } from '../../service/web-account.service';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

describe('ComptesWebComponentComponent', () => {
  let component: ComptesWebComponentComponent;
  let webAccountService: { getAllWebAccountByKeyWord: ReturnType<typeof vi.fn>; deleteWebAccount: ReturnType<typeof vi.fn>; getDateLog: ReturnType<typeof vi.fn>; getDistinctPools: ReturnType<typeof vi.fn> };
  let authService: { hasRole: ReturnType<typeof vi.fn> };
  let toastr: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    webAccountService = {
      getAllWebAccountByKeyWord: vi.fn().mockReturnValue(of({
        data: { content: [{ idCompteClientWeb: 1, login: 'test', date_expiration: new Date(Date.now() + 86400000) }], totalElements: 1 }
      })),
      deleteWebAccount: vi.fn().mockReturnValue(of({})),
      getDateLog: vi.fn().mockReturnValue(of({})),
      getDistinctPools: vi.fn().mockReturnValue(of({ data: [1, 2, 3] })),
    };
    authService = { hasRole: vi.fn().mockReturnValue(true) };
    toastr = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ComptesWebComponentComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: WebAccountService, useValue: webAccountService },
        { provide: AuthService, useValue: authService },
        { provide: ToastrService, useValue: toastr },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    }).compileComponents();

    component = TestBed.createComponent(ComptesWebComponentComponent).componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load web accounts on init', () => {
    component.ngOnInit();
    expect(webAccountService.getAllWebAccountByKeyWord).toHaveBeenCalled();
    expect(component.comptesWeb.length).toBe(1);
  });

  it('should check canDelete', () => {
    expect(component.canDelete()).toBe(true);
  });

  it('should search web accounts', () => {
    component.ngOnInit();
    component.searchWebAccount('test');
    expect(component.pagination.bigCurrentPage).toBe(1);
    expect(webAccountService.getAllWebAccountByKeyWord).toHaveBeenCalled();
  });

  it('should load available pools', () => {
    component.ngOnInit();
    expect(component.availablePools).toEqual([1, 2, 3]);
  });

  it('should handle pool loading error', () => {
    webAccountService.getDistinctPools.mockReturnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    // Since availablePools starts empty, if getDistinctPools errors it should remain empty
    // (Note: in component.ts, loadAvailablePools doesn't catchError to clear it if it fails on init, but we can verify it doesn't crash)
    expect(component.availablePools).toEqual([]);
  });

  it('should handle load error', () => {
    component.ngOnInit();
    webAccountService.getAllWebAccountByKeyWord.mockReturnValue(throwError(() => new Error('fail')));
    component.loadWebAccounts();
    expect(toastr.error).toHaveBeenCalled();
  });

  it('should handle accounts as direct array', () => {
    component.ngOnInit();
    webAccountService.getAllWebAccountByKeyWord.mockReturnValue(of([
      { idCompteClientWeb: 1, login: 'test', date_expiration: new Date(Date.now() + 86400000) }
    ]));
    component.loadWebAccounts();
    expect(component.comptesWeb.length).toBe(1);
  });

  it('should delete web account', () => {
    component.ngOnInit();
    component.selectedWebAccount = { idCompteClientWeb: 1 } as any;
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    webAccountService.deleteWebAccount.mockReturnValue(of({}));
    component.deleteWebAccount();
    expect(webAccountService.deleteWebAccount).toHaveBeenCalledWith(1);
  });

  it('should not delete if not confirmed', () => {
    component.ngOnInit();
    component.selectedWebAccount = { idCompteClientWeb: 1 } as any;
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteWebAccount();
    expect(webAccountService.deleteWebAccount).not.toHaveBeenCalled();
  });

  it('should get date log', () => {
    component.ngOnInit();
    component.getDateLogF('testuser');
    expect(webAccountService.getDateLog).toHaveBeenCalledWith('testuser');
  });

  it('should get region and pool controls', () => {
    component.ngOnInit();
    expect(component.regionControl).toBeTruthy();
    expect(component.poolControl).toBeTruthy();
  });
});
