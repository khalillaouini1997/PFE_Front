import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {IpAddressService} from './ip-address.service';
import {environment} from '../../environments/environment';
import {IpAddress} from '../data/data';

describe('IpAddressService', () => {
  let service: IpAddressService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiBaseUrl}ips`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        IpAddressService,
      ],
    });

    service = TestBed.inject(IpAddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have typeConnection list', () => {
    expect(service.typeConnection).toEqual([
      {type: 'jdbc'},
      {type: 'http'},
    ]);
  });

  describe('getAllIpAddresses', () => {
    it('should make GET request with query params', () => {
      const keyword = 'test';
      const page = 0;
      const size = 10;

      service.getAllIpAddresses(keyword, page, size).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/all?keyWord=${keyword}&page=${page}&size=${size}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({content: [], totalElements: 0});
    });
  });

  describe('saveIpAddress', () => {
    it('should make POST request to create IP address', () => {
      const ipAddress = {
        adresseIp: '192.168.1.1',
        port: 5000,
        typeConnection: 'jdbc',
      } as unknown as IpAddress;

      service.saveIpAddress(ipAddress).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(ipAddress);
      req.flush({id: 1, ...ipAddress});
    });
  });

  describe('deleteIpAddress', () => {
    it('should make DELETE request with id', () => {
      const id = 5;

      service.deleteIpAddress(id).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('updateIpAddress', () => {
    it('should make PUT request with id and body', () => {
      const id = 3;
      const ipAddress = {
        adresseIp: '10.0.0.1',
        port: 5001,
        typeConnection: 'http',
      } as unknown as IpAddress;

      service.updateIpAddress(id, ipAddress).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(ipAddress);
      req.flush({id, ...ipAddress});
    });
  });
});
