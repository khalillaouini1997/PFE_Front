import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AccessLogService } from './access-log.service';
import { environment } from '../../environments/environment';
import { AccessLog, PageResponse } from '../data/data';

describe('AccessLogService', () => {
  let service: AccessLogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AccessLogService,
      ],
    });
    service = TestBed.inject(AccessLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllAccessLog', () => {
    it('should GET access logs with pagination params', () => {
      const keyWord = 'login';
      const page = 0;
      const size = 20;
      const mockResponse: PageResponse<AccessLog> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 20,
        number: 0,
      };

      service.getAllAccessLog(keyWord, page, size).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}accessLog?keyWord=${keyWord}&page=${page}&size=${size}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should construct URL with different params', () => {
      const keyWord = 'admin';
      const page = 2;
      const size = 5;
      const mockResponse: PageResponse<AccessLog> = {
        content: [{ id: 1 } as AccessLog],
        totalElements: 15,
        totalPages: 3,
        size: 5,
        number: 2,
      };

      service.getAllAccessLog(keyWord, page, size).subscribe((data) => {
        expect(data.totalElements).toBe(15);
        expect(data.size).toBe(5);
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}accessLog?keyWord=${keyWord}&page=${page}&size=${size}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
