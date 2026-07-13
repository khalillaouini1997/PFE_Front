import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {CompteServerService} from './compte-server.service';
import {environment} from '../../environments/environment';
import {CompteServer} from '../data/data';

describe('CompteServerService', () => {
  let service: CompteServerService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiBaseUrl}compteServer`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CompteServerService,
      ],
    });

    service = TestBed.inject(CompteServerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateServerCompte', () => {
    it('should make PUT request with id and body', () => {
      const id = 1;
      const compte: CompteServer = {login: 'admin', pseudo: 'Admin'} as CompteServer;

      service.updateServerCompte(id, compte).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(compte);
      req.flush({id, ...compte});
    });
  });

  describe('deleteCompteServer', () => {
    it('should make DELETE request with id', () => {
      const id = 2;

      service.deleteCompteServer(id).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getAllServerAccount', () => {
    it('should make GET request with query params', () => {
      const keyWord = 'test';
      const page = 0;
      const size = 10;

      service.getAllServerAccount(keyWord, page, size).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}?keyWord=${keyWord}&page=${page}&size=${size}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({content: [], totalElements: 0});
    });
  });

  describe('getCompteServerById', () => {
    it('should make GET request with id', () => {
      const id = 3;

      service.getCompteServerById(id).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush({id, login: 'user1'});
    });
  });

  describe('addBoitiers', () => {
    it('should make POST request with nombreBoitier query param', () => {
      const idCompteServer = 1;
      const nbrBoitiers = 5;

      service.addBoitiers(idCompteServer, nbrBoitiers).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteServer}?nombreBoitier=${nbrBoitiers}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush({success: true});
    });
  });

  describe('getAllBoitierofIdcompte', () => {
    it('should make GET request with pagination params', () => {
      const idCompteServer = 1;
      const page = 0;
      const size = 100;

      service.getAllBoitierofIdcompte(idCompteServer, page, size).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteServer}/Boitiers?page=${page}&size=${size}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({content: []});
    });

    it('should use default pagination values', () => {
      const idCompteServer = 1;

      service.getAllBoitierofIdcompte(idCompteServer).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteServer}/Boitiers?page=0&size=10000`
      );
      expect(req.request.method).toBe('GET');
      req.flush({content: []});
    });
  });

  describe('extendIntervalOfBoitiers', () => {
    it('should make POST request to extend interval', () => {
      const idCompteServer = 2;

      service.extendIntervalOfBoitiers(idCompteServer).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteServer}/newInterval`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush({success: true});
    });
  });

  describe('getAllServerAccountForForm', () => {
    it('should make GET request to AllNames endpoint', () => {
      service.getAllServerAccountForForm().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/AllNames`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('createServerComptewithBoitier', () => {
    it('should make POST request with nombreBoitier and body', () => {
      const compte: CompteServer = {login: 'new', pseudo: 'New'} as CompteServer;
      const nbrBoitiers = 3;

      service.createServerComptewithBoitier(compte, nbrBoitiers).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/addNewComptewithBoitier?nombreBoitier=${nbrBoitiers}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(compte);
      req.flush({id: 1, ...compte});
    });
  });

  describe('isExistPseudo', () => {
    it('should make GET request with pseudo param', () => {
      const pseudo = 'admin';

      service.isExistPseudo(pseudo).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/pseudo?pseudo=${pseudo}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({exists: true});
    });
  });

  describe('isExistLogin', () => {
    it('should make GET request with login param', () => {
      const login = 'user1';

      service.isExistLogin(login).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/login?login=${login}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({exists: false});
    });
  });

  describe('ExportListComptesServer', () => {
    it('should make POST request with blob response type', () => {
      const comptes: CompteServer[] = [
        {id: 1, login: 'admin'},
        {id: 2, login: 'user1'},
      ] as unknown as CompteServer[];

      service.ExportListComptesServer(comptes).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/export`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(comptes);
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob());
    });
  });
});
