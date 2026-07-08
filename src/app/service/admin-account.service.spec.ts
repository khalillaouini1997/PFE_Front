import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminAccountService } from './admin-account.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { AdministratorCompte, PageResponse } from '../data/data';
import { vi } from 'vitest';

describe('AdminAccountService', () => {
  let service: AdminAccountService;
  let httpMock: HttpTestingController;
  let authServiceMock: { isAgentAdmin: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = { isAgentAdmin: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AdminAccountService,
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
    service = TestBed.inject(AdminAccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllAdminComptesByKeyWord', () => {
    it('should GET admin comptes when user is agent admin', () => {
      authServiceMock.isAgentAdmin.mockReturnValue(true);

      const keyword = 'test';
      const page = 0;
      const size = 10;
      const mockResponse: PageResponse<AdministratorCompte> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
      };

      service.getAllAdminComptesByKeyWord(keyword, page, size).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}adminCompteWeb/all?keyWord=${keyword}&page=${page}&size=${size}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should throw error when user is not agent admin', () => {
      authServiceMock.isAgentAdmin.mockReturnValue(false);

      service.getAllAdminComptesByKeyWord('test', 0, 10).subscribe({
        error: (err) => {
          expect(err.message).toBe('Not authorized to access administrator accounts.');
        },
      });
    });
  });

  describe('addAdminCompte', () => {
    it('should POST admin compte when user is agent admin', () => {
      authServiceMock.isAgentAdmin.mockReturnValue(true);

      const adminCompte: AdministratorCompte = {} as AdministratorCompte;

      service.addAdminCompte(adminCompte).subscribe((data) => {
        expect(data).toEqual(adminCompte);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}adminCompteWeb/add`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(adminCompte);
      req.flush(adminCompte);
    });

    it('should throw error when user is not agent admin', () => {
      authServiceMock.isAgentAdmin.mockReturnValue(false);

      service.addAdminCompte({} as AdministratorCompte).subscribe({
        error: (err) => {
          expect(err.message).toBe('Not authorized to add administrator accounts.');
        },
      });
    });
  });
});
