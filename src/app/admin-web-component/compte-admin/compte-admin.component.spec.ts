import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {of, throwError} from 'rxjs';
import {vi} from 'vitest';
import {CompteAdminComponent} from './compte-admin.component';
import {AdminAccountService} from 'src/app/service/admin-account.service';

describe('CompteAdminComponent', () => {
  let component: CompteAdminComponent;
  let fixture: ComponentFixture<CompteAdminComponent>;
  let adminAccountService: { getAllAdminComptesByKeyWord: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    adminAccountService = {
      getAllAdminComptesByKeyWord: vi.fn().mockReturnValue(of({
        data: {
          content: [],
          totalElements: 0
        }
      }))
    };

    await TestBed.configureTestingModule({
      imports: [CompteAdminComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: AdminAccountService, useValue: adminAccountService},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompteAdminComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(component.adminComptes).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.pagination).toBeTruthy();
  });

  it('should load admin comptes', () => {
    const mockData = [{idAdministratorCompte: 1, username: 'admin1', role: 'GLOBALADMINDESC'}];
    adminAccountService.getAllAdminComptesByKeyWord.mockReturnValue(of({data: {content: mockData, totalElements: 1}}));
    component.getAllAdminComptes('test', 0, 10);
    expect(component.adminComptes).toEqual(mockData);
    expect(component.pagination.bigTotalItems).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should handle empty data', () => {
    adminAccountService.getAllAdminComptesByKeyWord.mockReturnValue(of({data: {content: [], totalElements: 0}}));
    component.getAllAdminComptes('', 0, 10);
    expect(component.adminComptes).toEqual([]);
    expect(component.pagination.bigTotalItems).toBe(0);
  });

  it('should handle error', () => {
    adminAccountService.getAllAdminComptesByKeyWord.mockReturnValue(throwError(() => new Error('fail')));
    component.getAllAdminComptes('', 0, 10);
    expect(component.loading).toBe(false);
  });

  it('should handle direct array response', () => {
    const mockData = [{idAdministratorCompte: 1, username: 'admin1', role: 'AGENT'}];
    adminAccountService.getAllAdminComptesByKeyWord.mockReturnValue(of(mockData));
    component.getAllAdminComptes('', 0, 10);
    expect(component.adminComptes).toEqual(mockData);
  });

  it('should search and reset page', () => {
    const spy = vi.spyOn(component, 'getAllAdminComptes');
    component.searchWebAccount('keyword');
    expect(component.pagination.bigCurrentPage).toBe(1);
    expect(spy).toHaveBeenCalledWith('keyword', 0, component.pagination.itemsPerPage);
  });

  it('should handle page change', () => {
    const spy = vi.spyOn(component, 'getAllAdminComptes');
    component.onPageChanged({page: 2});
    expect(spy).toHaveBeenCalled();
  });
});
