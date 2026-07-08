import { TestBed } from '@angular/core/testing';
import { AccessLogComponent } from './access-log.component';
import { AccessLogService } from '../../service/access-log.service';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AccessLogComponent', () => {
  let component: AccessLogComponent;
  let accessLogService: { getAllAccessLog: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    accessLogService = {
      getAllAccessLog: vi.fn().mockReturnValue(of({
        data: { content: [{ id: 1, username: 'admin', action: 'LOGIN', timestamp: new Date(), ipAddress: '127.0.0.1' }], totalElements: 1 }
      })),
    };

    await TestBed.configureTestingModule({
      imports: [AccessLogComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AccessLogService, useValue: accessLogService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AccessLogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load access logs', () => {
    component.getAllAccessLogs('', 0, 10);
    expect(accessLogService.getAllAccessLog).toHaveBeenCalled();
    expect(component.accessLogs.length).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should search access logs', () => {
    component.searchAccess('test');
    expect(component.pagination.bigCurrentPage).toBe(1);
    expect(accessLogService.getAllAccessLog).toHaveBeenCalled();
  });

  it('should handle load error', () => {
    accessLogService.getAllAccessLog.mockReturnValue(throwError(() => new Error('fail')));
    component.getAllAccessLogs('', 0, 10);
    expect(component.loading).toBe(false);
  });

  it('should handle direct array response', () => {
    accessLogService.getAllAccessLog.mockReturnValue(of([
      { id: 1, username: 'admin', action: 'LOGIN' }
    ]));
    component.getAllAccessLogs('', 0, 10);
    expect(component.accessLogs.length).toBe(1);
  });

  it('should handle nested response structure', () => {
    accessLogService.getAllAccessLog.mockReturnValue(of({
      data: { content: [{ id: 1 }], totalElements: 1 }
    }));
    component.getAllAccessLogs('', 0, 10);
    expect(component.accessLogs.length).toBe(1);
  });
});
