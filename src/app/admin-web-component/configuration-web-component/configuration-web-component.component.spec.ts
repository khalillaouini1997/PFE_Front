import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ConfigurationWebComponentComponent } from './configuration-web-component.component';
import { WebSocketService } from '../../service/web-socket.service';
import { WebAccountService } from '../../service/web-account.service';
import { BoitierService } from '../../service/boitier.service';
import { IpAddressService } from '../../service/ip-address.service';
import { CompteServerService } from '../../service/compte-server.service';

describe('ConfigurationWebComponentComponent', () => {
  let component: ConfigurationWebComponentComponent;
  let fixture: ComponentFixture<ConfigurationWebComponentComponent>;
  let webSocketService: { getNotifications: ReturnType<typeof vi.fn> };
  let webAccountService: { getWebAccountById: ReturnType<typeof vi.fn>; getAllOptions: ReturnType<typeof vi.fn>; updateWebAccount: ReturnType<typeof vi.fn>; addOptionsToWebAccount: ReturnType<typeof vi.fn>; codesPays: any[] };
  let boitierService: { editPathConfig: ReturnType<typeof vi.fn>; editDeviceOptionConfig: ReturnType<typeof vi.fn>; editDeviceSetting: ReturnType<typeof vi.fn>; prepareDBForSingleDevise: ReturnType<typeof vi.fn>; prepareDBForAllDevises: ReturnType<typeof vi.fn>; resetOdometre: ReturnType<typeof vi.fn>; resetLastId: ReturnType<typeof vi.fn>; getDeviceIdImei: ReturnType<typeof vi.fn>; recalculeFuel: ReturnType<typeof vi.fn>; recalculeHistorique: ReturnType<typeof vi.fn>; recalculeAlert: ReturnType<typeof vi.fn>; recalculePaths: ReturnType<typeof vi.fn>; recalculeBoitier: ReturnType<typeof vi.fn>; resetRT: ReturnType<typeof vi.fn>; getDeviceOptionConfig: ReturnType<typeof vi.fn>; getPathConfig: ReturnType<typeof vi.fn>; getDeviceSettings: ReturnType<typeof vi.fn>; getLastId: ReturnType<typeof vi.fn> };
  let ipAddressService: { getAllIpAddresses: ReturnType<typeof vi.fn> };
  let compteServerService: { getAllServerAccountForForm: ReturnType<typeof vi.fn>; getAllBoitierofIdcompte: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    webSocketService = { getNotifications: vi.fn().mockReturnValue(of(null)) };
    webAccountService = {
      getWebAccountById: vi.fn().mockReturnValue(of({ data: { options: [], compteClientServer: {} } })),
      getAllOptions: vi.fn().mockReturnValue(of([])),
      updateWebAccount: vi.fn().mockReturnValue(of({})),
      addOptionsToWebAccount: vi.fn().mockReturnValue(of({})),
      codesPays: [{ key: 'Tunisie', value: '216' }],
    };
    boitierService = {
      editPathConfig: vi.fn().mockReturnValue(of({})),
      editDeviceOptionConfig: vi.fn().mockReturnValue(of({})),
      editDeviceSetting: vi.fn().mockReturnValue(of({})),
      prepareDBForSingleDevise: vi.fn().mockReturnValue(of({})),
      prepareDBForAllDevises: vi.fn().mockReturnValue(of({})),
      resetOdometre: vi.fn().mockReturnValue(of({})),
      resetLastId: vi.fn().mockReturnValue(of({})),
      getDeviceIdImei: vi.fn().mockReturnValue(of({ data: { id: 1 } })),
      recalculeFuel: vi.fn().mockReturnValue(of({})),
      recalculeHistorique: vi.fn().mockReturnValue(of({})),
      recalculeAlert: vi.fn().mockReturnValue(of({})),
      recalculePaths: vi.fn().mockReturnValue(of({})),
      recalculeBoitier: vi.fn().mockReturnValue(of({})),
      resetRT: vi.fn().mockReturnValue(of({})),
      getDeviceOptionConfig: vi.fn().mockReturnValue(of({ data: {} })),
      getPathConfig: vi.fn().mockReturnValue(of({ data: {} })),
      getDeviceSettings: vi.fn().mockReturnValue(of({ data: {} })),
      getLastId: vi.fn().mockReturnValue(of({ data: { lastId: 0 } })),
    };
    ipAddressService = { getAllIpAddresses: vi.fn().mockReturnValue(of({ content: [] })) };
    compteServerService = {
      getAllServerAccountForForm: vi.fn().mockReturnValue(of({ data: [] })),
      getAllBoitierofIdcompte: vi.fn().mockReturnValue(of({ data: [] })),
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(ToastrModule.forRoot()),
        { provide: WebSocketService, useValue: webSocketService },
        { provide: WebAccountService, useValue: webAccountService },
        { provide: BoitierService, useValue: boitierService },
        { provide: IpAddressService, useValue: ipAddressService },
        { provide: CompteServerService, useValue: compteServerService },
      ],
      imports: [ConfigurationWebComponentComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurationWebComponentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updateSqlQuery', () => {
    it('should set empty sqlQuery for unknown type', () => {
      component.updateSqlQuery('unknown', [1]);
      expect(component.sqlQuery).toBe('');
    });

    it('should set empty sqlQuery for empty deviceIds', () => {
      component.updateSqlQuery('recalcule trajet', []);
      expect(component.sqlQuery).toBe('');
    });

    it('should generate SQL for recalcule trajet', () => {
      component.updateSqlQuery('recalcule trajet', [42]);
      expect(component.sqlQuery).toContain('device_id = 42');
      expect(component.sqlQuery).toContain('delete from path');
      expect(component.sqlQuery).toContain('delete from stop');
    });

    it('should generate SQL for recalcule carburant', () => {
      component.updateSqlQuery('recalcule carburant', [10]);
      expect(component.sqlQuery).toContain('id_device = 10');
      expect(component.sqlQuery).toContain('delete from rep_fuel_variation');
    });

    it('should generate SQL for recalcule alert', () => {
      component.updateSqlQuery('recalcule alert', [5]);
      expect(component.sqlQuery).toContain('alertId = 5');
      expect(component.sqlQuery).toContain('delete from notification');
    });

    it('should generate SQL for recalcule boitier', () => {
      component.updateSqlQuery('recalcule boitier', [3]);
      expect(component.sqlQuery).toContain('device_id = 3');
      expect(component.sqlQuery).toContain('delete from rep_overspeed');
    });

    it('should generate SQL for recalcule Temps reel', () => {
      component.updateSqlQuery('recalcule Temps reel', [7]);
      expect(component.sqlQuery).toContain('deviceid = 7');
    });
  });

  describe('remove', () => {
    it('should remove item from selected', () => {
      const item1 = { id: 1 };
      const item2 = { id: 2 };
      component.selected.set([item1, item2]);
      component.remove(item1);
      expect(component.selected()).toEqual([item2]);
    });
  });

  describe('diffHours', () => {
    it('should calculate hours difference', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const result = component.diffHours(twoHoursAgo);
      expect(result).toBeGreaterThanOrEqual(1.9);
      expect(result).toBeLessThanOrEqual(2.1);
    });
  });

  describe('onCheckedBoitier', () => {
    it('should add boitier if not in list', () => {
      component.selectedBoitiersIds.set([]);
      component.onCheckedBoitier(1);
      expect(component.selectedBoitiersIds()).toContain(1);
    });

    it('should remove boitier if already in list', () => {
      component.selectedBoitiersIds.set([1, 2]);
      component.onCheckedBoitier(1);
      expect(component.selectedBoitiersIds()).not.toContain(1);
      expect(component.selectedBoitiersIds()).toContain(2);
    });
  });

  describe('isCheckedBoitier', () => {
    it('should return true if boitier is selected', () => {
      component.selectedBoitiersIds.set([1, 2]);
      expect(component.isCheckedBoitier(1)).toBe(true);
    });

    it('should return false if boitier is not selected', () => {
      component.selectedBoitiersIds.set([1, 2]);
      expect(component.isCheckedBoitier(3)).toBe(false);
    });
  });

  describe('onCheckedAllBoitiers', () => {
    it('should select all boitiers if none selected', () => {
      component.boitiers.set([{ numBoitier: 1 } as any, { numBoitier: 2 } as any]);
      component.selectedBoitiersIds.set([]);
      component.onCheckedAllBoitiers();
      expect(component.selectedBoitiersIds()).toEqual([1, 2]);
    });

    it('should deselect all boitiers if all selected', () => {
      component.boitiers.set([{ numBoitier: 1 } as any, { numBoitier: 2 } as any]);
      component.selectedBoitiersIds.set([1, 2]);
      component.onCheckedAllBoitiers();
      expect(component.selectedBoitiersIds()).toEqual([]);
    });
  });

  describe('getNumberOfBoitiersNotInstall', () => {
    it('should return count of boitiers not installed', () => {
      component.boitiers.set([
        { etatBoitier: 'NOT_INSTALLED' } as any,
        { etatBoitier: 'INSTALLED' } as any,
        { etatBoitier: 'NOT_INSTALLED' } as any,
      ]);
      expect(component.getNumberOfBoitiersNotInstall()).toBe(2);
    });
  });

  describe('getNumberOfNotificationErrors', () => {
    it('should return count of notification errors', () => {
      component.notifications.set([
        { value: 'ok', status: true },
        { value: 'err', status: false },
      ]);
      expect(component.getNumberOfNotificationErrors()).toBe(1);
    });
  });

  describe('showDevises', () => {
    it('should show warning for invalid server id', () => {
      component.showDevises(0);
      expect(component.boitiers()).toEqual([]);
    });

    it('should load boitiers for valid server id', () => {
      compteServerService.getAllBoitierofIdcompte.mockReturnValue(of({ data: [{ numBoitier: 1 }] }));
      component.showDevises(1);
      expect(compteServerService.getAllBoitierofIdcompte).toHaveBeenCalledWith(1);
    });
  });

  describe('getAllIps', () => {
    it('should load IP addresses', () => {
      ipAddressService.getAllIpAddresses.mockReturnValue(of({ content: [{ id: 1, ip: '1.2.3.4' }] }));
      component.getAllIps();
      expect(component.ipAddresses()).toEqual([{ id: 1, ip: '1.2.3.4' }]);
    });

    it('should handle error by setting empty array', () => {
      ipAddressService.getAllIpAddresses.mockReturnValue(throwError(() => new Error('fail')));
      component.getAllIps();
      expect(component.ipAddresses()).toEqual([]);
    });
  });

  describe('closeConfigModal', () => {
    it('should close modal', () => {
      component.closeConfigModal();
      expect(component.showConfigModal()).toBe(false);
    });
  });

  describe('updateBoitierState', () => {
    it('should update boitier state to INSTALLED', () => {
      component.boitiers.set([{ numBoitier: 1, etatBoitier: 'NOT_INSTALLED' } as any]);
      component.updateBoitierState(1);
      expect(component.boitiers()[0].etatBoitier).toBe('INSTALLED');
    });
  });
});
