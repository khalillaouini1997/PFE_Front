import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {BoitierService} from './boitier.service';
import {environment} from '../../environments/environment';
import {Boitier, DeviceOpt, DeviceSetting, PathConfigPayload, RecalculatePayload, VehiculeSetting,} from '../data/data';

describe('BoitierService', () => {
  let service: BoitierService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiBaseUrl}boities`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BoitierService,
      ],
    });

    service = TestBed.inject(BoitierService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('prepareDBForAllDevises', () => {
    it('should make POST request to prepareDB', () => {
      const idServer = 1;

      service.prepareDBForAllDevises(idServer).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${idServer}/prepareDB`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush(null);
    });
  });

  describe('prepareDBForSingleDevise', () => {
    it('should make POST request to device prepareDB', () => {
      const idServer = 1;
      const idBoitier = 42;

      service.prepareDBForSingleDevise(idServer, idBoitier).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idServer}/device/${idBoitier}/prepareDB`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush(null);
    });
  });

  describe('getBoitierOfAccount', () => {
    it('should make GET request with query params', () => {
      const id = 1;
      const keyword = 'test';
      const page = 0;
      const size = 10;

      service.getBoitierOfAccount(id, keyword, page, size).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}compteServer/${id}/Boitiers?keyWord=${keyword}&page=${page}&size=${size}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({content: [], totalElements: 0});
    });
  });

  describe('updateBoitier', () => {
    it('should make PUT request with query params and body', () => {
      const boitier = {id: 1, imei: '123456'} as unknown as Boitier;
      const idServer = 5;
      const updateType = 'full';

      service.updateBoitier(boitier, idServer, updateType).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}?idServer=${idServer}&updateType=${updateType}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(boitier);
      req.flush(boitier);
    });
  });

  describe('lastArchiveOfBoitier', () => {
    it('should make GET request for last archive', () => {
      const numBoitier = 10;

      service.lastArchiveOfBoitier(numBoitier).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${numBoitier}/lastArchive`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getRaws', () => {
    it('should make GET request with limit', () => {
      const numBoitier = 10;
      const limit = 100;

      service.getRaws(numBoitier, limit).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${numBoitier}/Raw/${limit}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({data: []});
    });
  });

  describe('getArchiveOfBoitier', () => {
    it('should make GET request for archives', () => {
      const numboitier = 10;
      const limit = 50;

      service.getArchiveOfBoitier(numboitier, limit).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${numboitier}/Archives/${limit}`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('recalculeHistorique', () => {
    it('should make PUT request with payload', () => {
      const idCompteWeb = 1;
      const payload = {startDate: '2024-01-01', endDate: '2024-01-31'} as unknown as RecalculatePayload;

      service.recalculeHistorique(idCompteWeb, payload).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/recalculate/historique`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });
  });

  describe('recalculeAlert', () => {
    it('should make PUT request with payload', () => {
      const idCompteWeb = 1;
      const payload = {startDate: '2024-01-01'} as unknown as RecalculatePayload;

      service.recalculeAlert(idCompteWeb, payload).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/recalculate/alert`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });
  });

  describe('recalculeFuel', () => {
    it('should make PUT request with payload', () => {
      const idCompteWeb = 2;
      const payload: RecalculatePayload = {} as RecalculatePayload;

      service.recalculeFuel(idCompteWeb, payload).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/recalculate/fuel`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });
  });

  describe('recalculePaths', () => {
    it('should make PUT request with payload', () => {
      const idCompteWeb = 3;
      const payload: RecalculatePayload = {} as RecalculatePayload;

      service.recalculePaths(idCompteWeb, payload).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/recalculate/paths`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });
  });

  describe('recalculeBoitier', () => {
    it('should make PUT request with payload', () => {
      const idCompteWeb = 4;
      const payload: RecalculatePayload = {} as RecalculatePayload;

      service.recalculeBoitier(idCompteWeb, payload).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/recalculate/resetboitier`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });
  });

  describe('resetRT', () => {
    it('should make PUT request with payload', () => {
      const idCompteWeb = 5;
      const payload: RecalculatePayload = {} as RecalculatePayload;

      service.resetRT(idCompteWeb, payload).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/recalculate/resetRT`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });
  });

  describe('getDeviceOptionConfig', () => {
    it('should make GET request for device options', () => {
      const idCompteWeb = 1;
      const idBoitier = 10;

      service.getDeviceOptionConfig(idCompteWeb, idBoitier).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/options/${idBoitier}`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getPathConfig', () => {
    it('should make GET request for path config', () => {
      const idCompteWeb = 1;
      const idBoitier = 10;

      service.getPathConfig(idCompteWeb, idBoitier).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/pathconfig/${idBoitier}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getDeviceSettings', () => {
    it('should make GET request for device settings', () => {
      const idCompteWeb = 1;
      const idBoitier = 10;

      service.getDeviceSettings(idCompteWeb, idBoitier).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/devicesettings/${idBoitier}`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('editDeviceOptionConfig', () => {
    it('should make PUT request with device options', () => {
      const idCompteWeb = 1;
      const deviceOpt = {id: 1, option: 'speed'} as unknown as DeviceOpt;

      service.editDeviceOptionConfig(idCompteWeb, deviceOpt).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/options`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(deviceOpt);
      req.flush(null);
    });
  });

  describe('editDeviceSetting', () => {
    it('should make PUT request with device setting', () => {
      const idCompteWeb = 1;
      const deviceSetting = {id: 1, key: 'apn'} as unknown as DeviceSetting;

      service.editDeviceSetting(idCompteWeb, deviceSetting).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/settings`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(deviceSetting);
      req.flush(null);
    });
  });

  describe('editPathConfig', () => {
    it('should make POST request with path config payload', () => {
      const idServer = 1;
      const pathConfigPayload = {path: '/data'} as unknown as PathConfigPayload;

      service.editPathConfig(idServer, pathConfigPayload).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/editPathConfig/${idServer}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(pathConfigPayload);
      req.flush(null);
    });
  });

  describe('resetOdometre', () => {
    it('should make PUT request with vehicule setting', () => {
      const idCompteWeb = 1;
      const vehiculeSetting = {odo: 0} as unknown as VehiculeSetting;

      service.resetOdometre(idCompteWeb, vehiculeSetting).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/resetOdo`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(vehiculeSetting);
      req.flush(null);
    });
  });

  describe('getLastId', () => {
    it('should make GET request for last id', () => {
      const idCompteWeb = 1;
      const idBoitier = 10;

      service.getLastId(idCompteWeb, idBoitier).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/lastId/${idBoitier}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({lastId: 123});
    });
  });

  describe('resetLastId', () => {
    it('should make PUT request to reset last id', () => {
      const idCompteWeb = 1;
      const vehiculeSetting: VehiculeSetting = {lastId: 0} as VehiculeSetting;

      service.resetLastId(idCompteWeb, vehiculeSetting).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${idCompteWeb}/resetLastId`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(vehiculeSetting);
      req.flush(null);
    });
  });

  describe('getDeviceIdImei', () => {
    it('should make GET request with query params', () => {
      const idIpAdresse = 1;
      const imei = 860012345678901;

      service.getDeviceIdImei(idIpAdresse, imei).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/device-by-imei?idIpAdresse=${idIpAdresse}&imei=${imei}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({id: 1});
    });
  });

  describe('getBoitierAnalysis', () => {
    it('should make GET request with default params', () => {
      const numBoitier = 10;

      service.getBoitierAnalysis(numBoitier).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${numBoitier}/analysis?days=30&limit=500`
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should make GET request with custom params', () => {
      const numBoitier = 10;
      const days = 7;
      const limit = 100;

      service.getBoitierAnalysis(numBoitier, days, limit).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/${numBoitier}/analysis?days=${days}&limit=${limit}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('deleteRaw', () => {
    it('should make DELETE request to remove raw', () => {
      service.deleteRaw(10, 42).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/10/Raw/42`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
