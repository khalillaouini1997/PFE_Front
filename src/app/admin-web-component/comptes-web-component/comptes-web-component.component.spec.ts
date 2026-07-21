import {TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComptesWebComponentComponent} from './comptes-web-component.component';
import {WebAccountService} from '../../service/web-account.service';
import {AuthService} from '../../service/auth.service';
import {ToastrService} from 'ngx-toastr';
import {TranslateModule} from '@ngx-translate/core';
import {of, throwError} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';

describe('ComptesWebComponentComponent', () => {
  let component: ComptesWebComponentComponent;
  let fixture: any;
  let webAccountService: {
    getAllWebAccountByKeyWord: ReturnType<typeof vi.fn>;
    deleteWebAccount: ReturnType<typeof vi.fn>;
    getDateLog: ReturnType<typeof vi.fn>;
    getDistinctPools: ReturnType<typeof vi.fn>
  };
  let authService: { hasRole: ReturnType<typeof vi.fn> };
  let toastr: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    webAccountService = {
      getAllWebAccountByKeyWord: vi.fn().mockReturnValue(of({
        data: {
          content: [{idCompteClientWeb: 1, login: 'test', date_expiration: new Date(Date.now() + 86400000)}],
          totalElements: 1
        }
      })),
      deleteWebAccount: vi.fn().mockReturnValue(of({})),
      getDateLog: vi.fn().mockReturnValue(of({})),
      getDistinctPools: vi.fn().mockReturnValue(of({data: [1, 2, 3]})),
    };
    authService = {hasRole: vi.fn().mockReturnValue(true)};
    toastr = {success: vi.fn(), error: vi.fn(), warning: vi.fn()};

    await TestBed.configureTestingModule({
      imports: [ComptesWebComponentComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: WebAccountService, useValue: webAccountService},
        {provide: AuthService, useValue: authService},
        {provide: ToastrService, useValue: toastr},
        {provide: ActivatedRoute, useValue: {params: of({})}},
        {provide: Router, useValue: {navigate: vi.fn()}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComptesWebComponentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load web accounts on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
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
    // getDistinctPools error leaves availablePools empty
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
      {idCompteClientWeb: 1, login: 'test', date_expiration: new Date(Date.now() + 86400000)}
    ]));
    component.loadWebAccounts();
    expect(component.comptesWeb.length).toBe(1);
  });

  it('should delete web account', () => {
    component.ngOnInit();
    component.selectedWebAccount = {idCompteClientWeb: 1} as any;
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    webAccountService.deleteWebAccount.mockReturnValue(of({}));
    component.deleteWebAccount();
    expect(webAccountService.deleteWebAccount).toHaveBeenCalledWith(1);
  });

  it('should not delete if not confirmed', () => {
    component.ngOnInit();
    component.selectedWebAccount = {idCompteClientWeb: 1} as any;
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

  it('should select web account and navigate', () => {
    const router = TestBed.inject(Router);
    component.ngOnInit();
    const compte = {idCompteClientWeb: 1, date_expiration: new Date(Date.now() + 86400000)};
    component.onSelect(compte as any);
    expect(router.navigate).toHaveBeenCalledWith(['/adminWeb/configurations', 1]);
  });

  it('should handle select with UTC hours 23', () => {
    const router = TestBed.inject(Router);
    component.ngOnInit();
    const date = new Date(Date.now() + 86400000);
    date.setUTCHours(23);
    const compte = {idCompteClientWeb: 1, date_expiration: date};
    component.onSelect(compte as any);
    expect(component.dt).toBeTruthy();
  });

  it('should load web accounts with pagination event', () => {
    component.ngOnInit();
    component.loadWebAccounts({first: 0, rows: 10});
    expect(webAccountService.getAllWebAccountByKeyWord).toHaveBeenCalled();
  });

  it('should handle pool as string value', () => {
    component.ngOnInit();
    component.searchForm.patchValue({pool: '2'});
    component.loadWebAccounts();
    expect(webAccountService.getAllWebAccountByKeyWord).toHaveBeenCalled();
  });

  it('should handle page changed', () => {
    component.ngOnInit();
    component.onPageChanged({first: 10, rows: 10});
    expect(component.pagination.bigCurrentPage).toBe(2);
  });

  it('should handle expired account', () => {
    webAccountService.getAllWebAccountByKeyWord.mockReturnValue(of({
      data: {
        content: [{idCompteClientWeb: 1, login: 'test', date_expiration: new Date(Date.now() - 86400000)}],
        totalElements: 1
      }
    }));
    component.ngOnInit();
    expect(component.comptesWeb[0].expired).toBe(true);
  });

  it('should handle non-expired account', () => {
    component.ngOnInit();
    expect(component.comptesWeb[0].expired).toBe(false);
    expect(component.comptesWeb[0].during).toBe(true);
  });

  it('should handle delete web account error', () => {
    component.ngOnInit();
    component.selectedWebAccount = {idCompteClientWeb: 1} as any;
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    webAccountService.deleteWebAccount.mockReturnValue(throwError(() => new Error('fail')));
    component.deleteWebAccount();
  });

  it('should have owner from environment', () => {
    expect(component.owner).toBeTruthy();
  });

  it('should handle loadWebAccounts with page data', () => {
    component.ngOnInit();
    webAccountService.getAllWebAccountByKeyWord.mockReturnValue(of({
      data: {
        content: [{idCompteClientWeb: 1, login: 'test', date_expiration: new Date(Date.now() + 86400000)}],
        page: {totalElements: 5}
      }
    }));
    component.loadWebAccounts();
    expect(component.pagination.bigTotalItems).toBe(5);
  });

  it('should handle loadWebAccounts with totalElements', () => {
    component.ngOnInit();
    webAccountService.getAllWebAccountByKeyWord.mockReturnValue(of({
      data: {content: [], totalElements: 10}
    }));
    component.loadWebAccounts();
    expect(component.pagination.bigTotalItems).toBe(10);
  });

  it('should guard against concurrent loadWebAccounts', () => {
    component.ngOnInit();
    (component as any).loadingInProgress = true;
    component.loadWebAccounts();
    expect(webAccountService.getAllWebAccountByKeyWord).toHaveBeenCalledTimes(1);
  });
});
