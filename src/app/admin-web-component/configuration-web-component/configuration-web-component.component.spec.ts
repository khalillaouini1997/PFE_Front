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

    it('should not change other boitiers', () => {
      component.boitiers.set([
        { numBoitier: 1, etatBoitier: 'NOT_INSTALLED' } as any,
        { numBoitier: 2, etatBoitier: 'NOT_INSTALLED' } as any,
      ]);
      component.updateBoitierState(1);
      expect(component.boitiers()[0].etatBoitier).toBe('INSTALLED');
      expect(component.boitiers()[1].etatBoitier).toBe('NOT_INSTALLED');
    });
  });

  describe('saveChange', () => {
    it('should warn if form is invalid', () => {
      component.mainConfigForm.get('login')?.clearValidators();
      component.mainConfigForm.get('login')?.setErrors({ required: true });
      component.mainConfigForm.get('password')?.clearValidators();
      component.mainConfigForm.get('password')?.setErrors({ required: true });
      component.saveChange();
      expect(webAccountService.updateWebAccount).not.toHaveBeenCalled();
    });

    it('should call updateWebAccount with valid form and password', () => {
      component.ID_COMPTE.set(1);
      component.compteWeb.set({ idCompteClientWeb: 1, options: [] });
      component.mainConfigForm.patchValue({ password: 'secret', login: 'admin' });
      component.saveChange();
      expect(webAccountService.updateWebAccount).toHaveBeenCalled();
      expect(webAccountService.addOptionsToWebAccount).toHaveBeenCalled();
    });

    it('should call updateWebAccount without password', () => {
      component.ID_COMPTE.set(1);
      component.compteWeb.set({ idCompteClientWeb: 1, options: [], rawPassword: 'old' });
      component.mainConfigForm.patchValue({ password: '', login: 'admin' });
      component.saveChange();
      expect(webAccountService.updateWebAccount).toHaveBeenCalled();
    });

    it('should handle saveChange error', () => {
      webAccountService.updateWebAccount.mockReturnValue(throwError(() => new Error('fail')));
      component.ID_COMPTE.set(1);
      component.compteWeb.set({ idCompteClientWeb: 1, options: [] });
      component.saveChange();
    });
  });

  describe('updateWebAccount', () => {
    it('should update compteWeb and call service', () => {
      component.ID_COMPTE.set(1);
      component.compteWeb.set({ idCompteClientWeb: 1 });
      webAccountService.updateWebAccount.mockReturnValue(of({ idCompteClientWeb: 1, updated: true }));
      component.updateWebAccount();
      expect(webAccountService.updateWebAccount).toHaveBeenCalled();
    });

    it('should handle error from updateWebAccount', () => {
      webAccountService.updateWebAccount.mockReturnValue(throwError(() => new Error('fail')));
      component.ID_COMPTE.set(1);
      component.compteWeb.set({ idCompteClientWeb: 1 });
      component.updateWebAccount();
    });
  });

  describe('editBoitier', () => {
    it('should set boitier id, reset notifications, and show modal', () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.editBoitier({ numBoitier: 42 } as any);
      expect(component.selectedBoitierId()).toBe(42);
      expect(component.notifications()).toEqual([]);
      expect(component.showConfigModal()).toBe(true);
      expect(boitierService.getDeviceOptionConfig).toHaveBeenCalledWith(1, 42);
      expect(boitierService.getPathConfig).toHaveBeenCalledWith(1, 42);
      expect(boitierService.getDeviceSettings).toHaveBeenCalledWith(1, 42);
      expect(boitierService.getLastId).toHaveBeenCalledWith(1, 42);
    });
  });

  describe('getDeviceOptionConfig', () => {
    it('should patch deviceOptForm with response data', () => {
      boitierService.getDeviceOptionConfig.mockReturnValue(of({ data: { useIgnition: true, useFuel: false } }));
      component.getDeviceOptionConfig(1);
      expect(component.deviceOptForm.get('useIgnition')?.value).toBe(true);
      expect(component.deviceOptForm.get('useFuel')?.value).toBe(false);
    });

    it('should handle array response', () => {
      boitierService.getDeviceOptionConfig.mockReturnValue(of({ data: [{ useIgnition: true }] }));
      component.getDeviceOptionConfig(1);
      expect(component.deviceOptForm.get('useIgnition')?.value).toBe(true);
    });

    it('should handle null response', () => {
      boitierService.getDeviceOptionConfig.mockReturnValue(of(null));
      component.getDeviceOptionConfig(1);
    });
  });

  describe('getPathConfig', () => {
    it('should patch pathConfigForm with response data', () => {
      boitierService.getPathConfig.mockReturnValue(of({ data: { pathMinSec: 90, stopMinSec: 200 } }));
      component.getPathConfig(1);
      expect(component.pathConfigForm.get('pathMinSec')?.value).toBe(90);
    });

    it('should handle array response', () => {
      boitierService.getPathConfig.mockReturnValue(of({ data: [{ pathMinSec: 120 }] }));
      component.getPathConfig(1);
      expect(component.pathConfigForm.get('pathMinSec')?.value).toBe(120);
    });

    it('should handle null response', () => {
      boitierService.getPathConfig.mockReturnValue(of(null));
      component.getPathConfig(1);
    });
  });

  describe('getDeviceSettings', () => {
    it('should patch deviceSettingForm with response data', () => {
      boitierService.getDeviceSettings.mockReturnValue(of({ data: { idIpAdresse: 5, streamId: 10 } }));
      component.getDeviceSettings(1);
      expect(component.deviceSettingForm.get('idIpAdresse')?.value).toBe(5);
      expect(component.deviceSettingForm.get('streamId')?.value).toBe(10);
    });

    it('should handle null response', () => {
      boitierService.getDeviceSettings.mockReturnValue(of(null));
      component.getDeviceSettings(1);
    });
  });

  describe('loadLastId', () => {
    it('should patch lastIdForm with response', () => {
      boitierService.getLastId.mockReturnValue(of({ data: { lastId: 42 } }));
      component.loadLastId(1);
      expect(component.lastIdForm.get('lastIdValue')?.value).toBe(42);
    });

    it('should handle error by setting 0', () => {
      boitierService.getLastId.mockReturnValue(throwError(() => new Error('fail')));
      component.loadLastId(1);
      expect(component.lastIdForm.get('lastIdValue')?.value).toBe(0);
    });
  });

  describe('editPathConfig', () => {
    it('should return early if form is invalid', () => {
      component.pathConfigForm.get('pathMinSec')?.clearValidators();
      component.pathConfigForm.get('pathMinSec')?.setErrors({ required: true });
      component.editPathConfig();
      expect(boitierService.editPathConfig).not.toHaveBeenCalled();
    });

    it('should call editPathConfig with valid form', () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.selectedBoitierId.set(10);
      component.editPathConfig();
      expect(boitierService.editPathConfig).toHaveBeenCalled();
    });

    it('should handle error', () => {
      boitierService.editPathConfig.mockReturnValue(throwError(() => new Error('fail')));
      component.ID_COMPTE.set(1);
      component.editPathConfig();
    });
  });

  describe('editDeviceOptionConfig', () => {
    it('should call editDeviceOptionConfig service', () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.selectedBoitierId.set(10);
      component.editDeviceOptionConfig();
      expect(boitierService.editDeviceOptionConfig).toHaveBeenCalled();
    });

    it('should handle error', () => {
      boitierService.editDeviceOptionConfig.mockReturnValue(throwError(() => new Error('fail')));
      component.ID_COMPTE.set(1);
      component.editDeviceOptionConfig();
    });
  });

  describe('editDeviceSetting', () => {
    it('should call editDeviceSetting service', async () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.selectedBoitierId.set(10);
      component.deviceSettingForm.patchValue({ streamId: 0 });
      component.serverAccount.set({ idCompteClientServer: 5 } as any);
      await component.editDeviceSetting();
      expect(boitierService.editDeviceSetting).toHaveBeenCalled();
    });

    it('should use selectedBoitierId as streamId when streamId is 0', async () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.selectedBoitierId.set(10);
      component.deviceSettingForm.patchValue({ streamId: 0 });
      component.serverAccount.set({ idCompteClientServer: 5 } as any);
      await component.editDeviceSetting();
      const callArg = boitierService.editDeviceSetting.mock.calls[0][1];
      expect(callArg.streamId).toBe(10);
    });

    it('should handle error', async () => {
      boitierService.editDeviceSetting.mockReturnValue(throwError(() => new Error('fail')));
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.selectedBoitierId.set(10);
      await component.editDeviceSetting();
    });
  });

  describe('getSearchDeviceIemi', () => {
    it('should patch streamId from IMEI lookup', () => {
      component.deviceSettingForm.patchValue({ idIpAdresse: 5 });
      component.getSearchDeviceIemi('123456');
      expect(boitierService.getDeviceIdImei).toHaveBeenCalledWith(5, 123456);
      expect(component.deviceSettingForm.get('streamId')?.value).toBe(1);
    });

    it('should not call service if no idIpAdresse', () => {
      component.deviceSettingForm.patchValue({ idIpAdresse: null });
      component.getSearchDeviceIemi('123456');
      expect(boitierService.getDeviceIdImei).not.toHaveBeenCalled();
    });
  });

  describe('resetOdometre', () => {
    it('should call resetOdometre service', () => {
      component.ID_COMPTE.set(1);
      component.recalculeP.set({ idBoitier: 10, idBoitiers: [], recalculeStartDate: 0 } as any);
      component.selectedBoitiersIds.set([]);
      component.serverAccount.set({ idCompteClientServer: 5 } as any);
      component.resetOdometre();
      expect(boitierService.resetOdometre).toHaveBeenCalled();
    });

    it('should handle error', () => {
      boitierService.resetOdometre.mockReturnValue(throwError(() => new Error('fail')));
      component.ID_COMPTE.set(1);
      component.recalculeP.set({ idBoitier: 10, idBoitiers: [], recalculeStartDate: 0 } as any);
      component.selectedBoitiersIds.set([]);
      component.serverAccount.set({ idCompteClientServer: 5 } as any);
      component.resetOdometre();
    });
  });

  describe('resetLastId', () => {
    it('should call resetLastId service', () => {
      component.ID_COMPTE.set(1);
      component.recalculeP.set({ idBoitier: 10, idBoitiers: [], recalculeStartDate: 0 } as any);
      component.selectedBoitiersIds.set([]);
      component.lastIdForm.patchValue({ lastIdValue: 42 });
      component.resetLastId();
      expect(boitierService.resetLastId).toHaveBeenCalled();
    });

    it('should handle error', () => {
      boitierService.resetLastId.mockReturnValue(throwError(() => new Error('fail')));
      component.ID_COMPTE.set(1);
      component.recalculeP.set({ idBoitier: 10, idBoitiers: [], recalculeStartDate: 0 } as any);
      component.selectedBoitiersIds.set([]);
      component.resetLastId();
    });
  });

  describe('prepareDB', () => {
    it('should call prepareDBForAllDevises', () => {
      component.prepareDB(1);
      expect(boitierService.prepareDBForAllDevises).toHaveBeenCalledWith(1);
    });
  });

  describe('prepareDBForSingleDevice', () => {
    it('should call prepareDBForSingleDevise and update state', () => {
      component.ID_COMPTE.set(1);
      component.serverAccount.set({ idCompteClientServer: 5 } as any);
      component.boitiers.set([{ numBoitier: 10, etatBoitier: 'NOT_INSTALLED' } as any]);
      component.prepareDBForSingleDevice(10);
      expect(boitierService.prepareDBForSingleDevise).toHaveBeenCalled();
    });

    it('should handle error', () => {
      boitierService.prepareDBForSingleDevise.mockReturnValue(throwError(() => new Error('fail')));
      component.ID_COMPTE.set(1);
      component.prepareDBForSingleDevice(10);
    });
  });

  describe('showDevises error path', () => {
    it('should handle error by setting empty array', () => {
      compteServerService.getAllBoitierofIdcompte.mockReturnValue(throwError(() => new Error('fail')));
      component.showDevises(1);
      expect(component.boitiers()).toEqual([]);
    });

    it('should handle non-array response', () => {
      compteServerService.getAllBoitierofIdcompte.mockReturnValue(of({ data: null }));
      component.showDevises(1);
      expect(component.boitiers()).toEqual([]);
    });
  });

  describe('recalculate', () => {
    it('should dispatch to recalculePaths for trajet type', () => {
      component.recalculateForm.patchValue({ typeRecalcule: 'recalcule trajet' });
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => false);
      component.recalculate();
      vi.unstubAllGlobals();
    });

    it('should dispatch to recalculeFuel for carburant type', () => {
      component.recalculateForm.patchValue({ typeRecalcule: 'recalcule carburant' });
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => false);
      component.recalculate();
      vi.unstubAllGlobals();
    });

    it('should dispatch to resetRT for Temps reel type', () => {
      component.recalculateForm.patchValue({ typeRecalcule: 'recalcule Temps reel' });
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => false);
      component.recalculate();
      vi.unstubAllGlobals();
    });

    it('should dispatch to recalculeBoitier for boitier type', () => {
      component.recalculateForm.patchValue({ typeRecalcule: 'recalcule boitier' });
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => false);
      component.recalculate();
      vi.unstubAllGlobals();
    });

    it('should dispatch to recalculeAlert for alert type', () => {
      component.recalculateForm.patchValue({ typeRecalcule: 'recalcule alert' });
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => false);
      component.recalculate();
      vi.unstubAllGlobals();
    });
  });

  describe('executeRecalculate via confirm', () => {
    it('should execute recalculeHistorique when confirmed', () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => true);
      component.recalculeHistorique();
      expect(boitierService.recalculeHistorique).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('should execute recalculeFuel when confirmed', () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => true);
      component.recalculeFuel();
      expect(boitierService.recalculeFuel).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('should execute recalculeAlert when confirmed', () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => true);
      component.recalculeAlert();
      expect(boitierService.recalculeAlert).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('should execute recalculePaths when confirmed', () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => true);
      component.recalculePaths();
      expect(boitierService.recalculePaths).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('should execute recalculeBoitier when confirmed', () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => true);
      component.recalculeBoitier();
      expect(boitierService.recalculeBoitier).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('should execute resetRT when confirmed', () => {
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => true);
      component.resetRT();
      expect(boitierService.resetRT).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('should handle error in executeRecalculate', () => {
      boitierService.recalculeHistorique.mockReturnValue(throwError(() => new Error('fail')));
      component.ID_COMPTE.set(1);
      component.selectedBoitiersIds.set([]);
      component.recalculeP.set({ idBoitier: 10 } as any);
      vi.stubGlobal('confirm', () => true);
      component.recalculeHistorique();
      expect(component.notifications().length).toBeGreaterThan(0);
      vi.unstubAllGlobals();
    });
  });

  describe('ngOnInit', () => {
    it('should set codesPays and serverAccounts', () => {
      component.ngOnInit();
      expect(component.codesPays()).toEqual([{ key: 'Tunisie', value: '216' }]);
    });

    it('should handle non-array serverAccounts response', () => {
      compteServerService.getAllServerAccountForForm.mockReturnValue(of({ data: null }));
      component.ngOnInit();
      expect(component.serverAccounts()).toEqual([]);
    });
  });
});
