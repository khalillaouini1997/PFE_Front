import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {WebAccountService} from './web-account.service';

describe('WebAccountService', () => {
  let service: WebAccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WebAccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.match(() => true);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('addCompteWeb should POST', () => {
    const body = {login: 'test'};
    service.addCompteWeb(body).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('compteWeb'));
    expect(req.request.method).toBe('POST');
    req.flush({id: 1});
  });

  it('getAllWebAccountByKeyWord should GET with params', () => {
    service.getAllWebAccountByKeyWord('test', 0, 10).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('compteWeb') && r.url.includes('keyWord='));
    expect(req.request.method).toBe('GET');
    req.flush({content: [], totalElements: 0});
  });

  it('getAllWebAccountByKeyWord should include region', () => {
    service.getAllWebAccountByKeyWord('test', 0, 10, 'Tunis').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('compteWeb') && r.url.includes('region=Tunis'));
    req.flush({content: []});
  });

  it('getAllWebAccountByKeyWord should include pool', () => {
    service.getAllWebAccountByKeyWord('test', 0, 10, undefined, 5).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('compteWeb') && r.url.includes('pool=5'));
    req.flush({content: []});
  });

  it('getWebAccountById should GET by id', () => {
    service.getWebAccountById(42).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('compteWeb/42'));
    expect(req.request.method).toBe('GET');
    req.flush({id: 42});
  });

  it('updateWebAccount should PUT', () => {
    service.updateWebAccount(10, {login: 'updated'}).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('compteWeb/10'));
    expect(req.request.method).toBe('PUT');
    req.flush({id: 10});
  });

  it('deleteWebAccount should DELETE', () => {
    service.deleteWebAccount(5).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('compteWeb/5'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getAllLastTram should GET lastTrame', () => {
    service.getAllLastTram(1).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('lastTrame'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('exportLastTram should POST with blob response', () => {
    service.exportLastTram([{id: 1}] as any).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('lastTrame/export'));
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['test']));
  });

  it('getAllWebAccountNames should GET AllNames', () => {
    service.getAllWebAccountNames().subscribe();
    const req = httpMock.expectOne(r => r.url.includes('AllNames'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('associateCompteWebToCompteServer should POST', () => {
    service.associateCompteWebToCompteServer(1, 2).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('compteServer/2'));
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('getDeviceInstallationEvolution should GET', () => {
    service.getDeviceInstallationEvolution(1).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('device-installation-evolution'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getDistinctPools should GET pools', () => {
    service.getDistinctPools().subscribe();
    const req = httpMock.expectOne(r => r.url.includes('pools'));
    expect(req.request.method).toBe('GET');
    req.flush([1, 2]);
  });

  it('getAllLastTramGlobal should GET with limit', () => {
    service.getAllLastTramGlobal(50).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('AllLastTram'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getAllLastTramSummary should GET', () => {
    service.getAllLastTramSummary().subscribe();
    const req = httpMock.expectOne(r => r.url.includes('summary'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getAllLastTramMapData should GET', () => {
    service.getAllLastTramMapData().subscribe();
    const req = httpMock.expectOne(r => r.url.includes('map'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getTotalDeviceCount should GET', () => {
    service.getTotalDeviceCount().subscribe();
    const req = httpMock.expectOne(r => r.url.includes('device-count'));
    expect(req.request.method).toBe('GET');
    req.flush(42);
  });

  it('getDateLog should GET', () => {
    service.getDateLog('user1').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('datelog=user1'));
    expect(req.request.method).toBe('GET');
    req.flush('2024-01-01');
  });

  it('addOptionsToWebAccount should POST', () => {
    service.addOptionsToWebAccount(1, [{idOption: 1} as any]).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/Options'));
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('getAllOptions should GET', () => {
    service.getAllOptions().subscribe();
    const req = httpMock.expectOne(r => r.url.includes('options'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should have codesPays', () => {
    expect(service.codesPays.length).toBe(3);
    expect(service.codesPays[0].key).toBe('Maroc');
  });
});
