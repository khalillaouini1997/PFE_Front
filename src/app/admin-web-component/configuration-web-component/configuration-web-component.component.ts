import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Boitier,
  CompteServer,
  Option, PathConfigPayload,
  RecalculatePayload,
  IpAddress,
  VehiculeSetting,
  createCompteServer,
  createRecalculatePayload,
  createVehiculeSetting,
} from "../../data/data";
import { ActivatedRoute, Params } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { WebSocketService } from "../../service/web-socket.service";
import { WebAccountService } from "../../service/web-account.service";

import { BoitierService } from "../../service/boitier.service";
import { IpAddressService } from "../../service/ip-address.service";
import { CompteServerService } from "../../service/compte-server.service";
import { of } from "rxjs";
import { catchError } from "rxjs/operators";
import { NOTIFICATION_SUBQUERIES } from '../../shared/constants';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { withToast } from '../../utils/toast.helpers';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
import { DatePickerModule } from 'primeng/datepicker';

import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-configuration-web-component',
    standalone: true,
    templateUrl: './configuration-web-component.component.html',
    styleUrls: ['./configuration-web-component.component.css'],
    imports: [CommonModule, ReactiveFormsModule, NgSelectModule, NgMultiSelectDropDownModule, TableModule, DatePipe, TranslateModule, DatePickerModule]
})
export class ConfigurationWebComponentComponent implements OnInit {

  mainConfigForm!: FormGroup;
  recalculateForm!: FormGroup;
  deviceOptForm!: FormGroup;
  pathConfigForm!: FormGroup;
  deviceSettingForm!: FormGroup;
  imeiSearchForm!: FormGroup;
  lastIdForm!: FormGroup;
  @ViewChild('configModal') configModal!: ElementRef<HTMLDialogElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly toastr = inject(ToastrService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly boitierService = inject(BoitierService);
  private readonly ipAddressService = inject(IpAddressService);
  private readonly compteServerService = inject(CompteServerService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  ID_COMPTE = signal<number>(0);
  compteWeb = signal<any>({});
  serverAccount = signal<CompteServer>(createCompteServer());
  serverAccounts = signal<CompteServer[]>([]);
  selected = signal<any[]>([]);
  codesPays = signal<{ key: string; value: string; }[]>([]);
  options = signal<Option[]>([]);
  
  // Data Signals
  boitiers = signal<Boitier[]>([]);
  boitiersClicked = signal<boolean>(false);
  selectedBoitierId = signal<number>(0);
  selectedServerId = signal<number>(0);
  ipAddresses = signal<IpAddress[]>([]);
  notifications = signal<{ value: string, status: boolean }[]>([]);
  selectedBoitiersIds = signal<number[]>([]);
  recalculeP = signal<RecalculatePayload>(createRecalculatePayload());
  vehiculeSetting = signal<VehiculeSetting>(createVehiculeSetting());

  // UI & Modal State
  showConfigModal = signal<boolean>(false);
  activeTab = signal<string>('recalculate');
  loadingRecalculate = signal<boolean>(false);
  loadingEditDeviceOption = signal<boolean>(false);
  loadingEditPathConfig = signal<boolean>(false);
  loadingResetOdometre = signal<boolean>(false);
  loadingResetLastId = signal<boolean>(false);
  loadingDeviceSetting = signal<boolean>(false);
  dropdownSettings: IDropdownSettings = { defaultOpen: false };

  readonly optionsList = [
    { key: 'useIgnition', label: 'Ignition', icon: 'fa-key' },
    { key: 'useFuel', label: 'Fuel', icon: 'fa-gas-pump' },
    { key: 'useTemp', label: 'Temperature', icon: 'fa-thermometer-half' },
    { key: 'useFms', label: 'FMS (CAN)', icon: 'fa-bus' },
    { key: 'useJ1708', label: 'J1708 Bus', icon: 'fa-link' },
    { key: 'useIdDriver', label: 'Driver ID', icon: 'fa-user' },
    { key: 'useStop', label: 'Stop Detection', icon: 'fa-stop-circle' },
    { key: 'useDoor', label: 'Door 1', icon: 'fa-door-closed' },
    { key: 'useDoor2', label: 'Door 2', icon: 'fa-door-closed' }
  ];

  readonly recalculateTypes = [
    { value: 'recalcule trajet', label: 'RECALC.PATH' },
    { value: 'recalcule boitier', label: 'RECALC.BOX' },
    { value: 'recalcule carburant', label: 'RECALC.FUEL' },
    { value: 'recalcule alert', label: 'RECALC.ALERT' },
    { value: 'recalcule Temps reel', label: 'RECALC.REAL_TIME' }
  ];


  date = computed(() => this.mainConfigForm.get('date_expiration')?.value as Date | null);
  checked = computed(() => !!this.mainConfigForm.get('mobileNotif')?.value);
  datestart = computed(() => this.recalculateForm.get('datestart')?.value as Date | null);
  typeRecalcule = computed(() => this.recalculateForm.get('typeRecalcule')?.value as string);
  deviceSetting = computed(() => this.deviceSettingForm.value);
  imei = computed(() => this.imeiSearchForm.get('imei')?.value as string);
  deviceOpt = computed(() => this.deviceOptForm.value);
  pathConfig = computed(() => this.pathConfigForm.value);


  readonly regions = ['Tunis', 'Sfax', 'Sousse'];
  readonly notifSubs = NOTIFICATION_SUBQUERIES;
  dateBoolean: boolean = true;
  readonly maxDate: Date = new Date();
  sqlQuery: string = '';
  showSqlBox: boolean = false;



  constructor() {
    this.notifications.set([]);
    this.webSocketService.getNotifications().subscribe(_ => { });
    this.initForms();
  }


  initForms() {
    this.mainConfigForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
      code_pays: ['', Validators.required],
      date_expiration: [new Date(), Validators.required],
      options: [[]],
      pool: [0, [Validators.required, Validators.min(0), Validators.max(4)]],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      area: ['', Validators.required],
      notificationSubquery: [''],
      mobileNotif: [false],
      idCompteServer: [null, Validators.required] // Added idCompteServer
    });

    this.recalculateForm = this.fb.group({
      datestart: [new Date(), Validators.required],
      typeRecalcule: ['recalcule trajet', Validators.required]
    });

    this.deviceOptForm = this.fb.group({
      useIgnition: [false],
      useFuel: [false],
      useTemp: [false],
      useFms: [false],
      useJ1708: [false],
      useIdDriver: [false],
      useStop: [false],
      useDoor: [false],
      useDoor2: [false]
    });

    this.pathConfigForm = this.fb.group({
      pathMinSec: [60, Validators.required],
      stopMinSec: [120, Validators.required],
      pauseMinSec: [60, Validators.required],
      distanceMinMeter: [10, Validators.required],
      pathMinSpeed: [1, Validators.required]
    });

    this.deviceSettingForm = this.fb.group({
      idIpAdresse: [null],
      streamId: [0]
    });

    this.imeiSearchForm = this.fb.group({
      imei: ['']
    });

    this.lastIdForm = this.fb.group({
      lastIdValue: [0]
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.ID_COMPTE.set(+params['idCompteClientWeb']);
      this.webAccountService.getWebAccountById(this.ID_COMPTE()).subscribe(async (res: any) => {
        const _compteWeb = res?.data || res;
        this.webAccountService.getAllOptions().subscribe(opts => {
          this.options.set(opts);
        });
        this.compteWeb.set(_compteWeb);
        const serverData = _compteWeb.compteClientServer || createCompteServer();
        const mappedServer = {
          ...serverData,
          date_creation: serverData.dateCreation || serverData.date_creation,
          date_Expiration: serverData.dateExpiration || serverData.date_Expiration
        };
        this.serverAccount.set(mappedServer);
        this.selected.set(_compteWeb.options || []);

        this.mainConfigForm.patchValue({
          login: _compteWeb.login,
          password: _compteWeb.rawPassword,
          code_pays: _compteWeb.code_pays,
          date_expiration: new Date(_compteWeb.date_expiration),
          options: _compteWeb.options,
          pool: _compteWeb.pool,
          firstname: _compteWeb.firstname,
          lastname: _compteWeb.lastname,
          email: _compteWeb.email,
          telephone: _compteWeb.telephone,
          area: _compteWeb.area,
          notificationSubquery: _compteWeb.notificationSubquery,
          mobileNotif: _compteWeb.mobileNotif,
          idCompteServer: _compteWeb.compteClientServer?.idCompteClientServer || null
        });

        const currentServer = this.serverAccount();
        if (currentServer && currentServer.date_Expiration && Date.now() < currentServer.date_Expiration) {
          this.serverAccount.update(s => ({ ...s, expired: false, during: true }));
        } else if (currentServer) {
          this.serverAccount.update(s => ({ ...s, expired: true, during: false }));
        }
      });
    });
    this.codesPays.set(this.webAccountService.codesPays);
    this.compteServerService.getAllServerAccountForForm().subscribe((res: any) => {
      const responseData = res?.data || res;
      this.serverAccounts.set(Array.isArray(responseData) ? responseData : []);
    });
    this.getAllIps();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'idOption',
      textField: 'description',
      selectAllText: this.translate.instant('SERVER_DETAILS.SELECT_ALL'),
      unSelectAllText: this.translate.instant('SERVER_DETAILS.UNSELECT_ALL'),
      itemsShowLimit: 3,
      allowSearchFilter: true,
      defaultOpen: false
    };
  }


  getAllIps() {
    this.ipAddressService.getAllIps().subscribe({
      next: (res) => {
        this.ipAddresses.set(res);
      },
      error: () => {
        this.ipAddresses.set([]);
      }
    });
  }


  remove(item: any) {
    this.selected.update(arr => arr.filter(i => i !== item));
  }



  saveChange() {
    if (this.mainConfigForm.invalid) {
      this.toastr.warning(this.translate.instant('WEB_ACCOUNTS.FILL_REQUIRED'), this.translate.instant('COMMON.WARNING'));
      return;
    }
    const formValue = this.mainConfigForm.value;
    const updatedCompte = {
      ...this.compteWeb(),
      ...formValue,
      rawPassword: formValue.password,
      date_expiration: (formValue.date_expiration as Date).getTime(),
      options: formValue.options
    };

    withToast(this.webAccountService.updateWebAccount(this.ID_COMPTE(), updatedCompte), this.toastr, this.translate, 'WEB_ACCOUNTS.ADD_SUCCESS')
      .pipe(
        catchError(() => {
          return of(null);
        })
      )
      .subscribe();

    this.webAccountService.addOptionsToWebAccount(this.ID_COMPTE(), formValue.options).subscribe();
  }

  diffHours(date: Date): number {
    date = new Date(date);
    return (Date.now() - date.getTime()) / (60 * 60 * 1000);
  }

  updateWebAccount() {
    const expirationDate = this.date();
    if (expirationDate !== null) {
      this.compteWeb.update(c => ({ ...c, date_expiration: expirationDate.getTime() }));
    }
    this.compteWeb.update(c => ({ ...c, options: this.mainConfigForm.value.options }));

    const currentCompte = this.compteWeb();
    withToast(this.webAccountService.updateWebAccount(currentCompte.idCompteClientWeb, currentCompte), this.toastr, this.translate, 'WEB_ACCOUNTS.ADD_SUCCESS')
      .pipe(
        catchError(() => {
          return of(null);
        })
      )
      .subscribe(updatedCompteWeb => {
        if (updatedCompteWeb) {
          this.compteWeb.set(updatedCompteWeb);
        }
      });
  }

  numNotificationErrors = computed(() => this.notifications().filter(n => !n.status).length);

  getNumberOfNotificationErrors(): number {
    return this.numNotificationErrors();
  }


  numBoitierNotInstall = computed(() => this.boitiers().filter(b => b.etatBoitier === 'NOT_INSTALLED').length);

  getNumberOfBoitiersNotInstall(): number {
    return this.numBoitierNotInstall();
  }


  editPathConfig() {
    if (this.pathConfigForm.invalid) return;
    this.loadingEditPathConfig.set(true);
    const selectedBoitiersId = [...this.selectedBoitiersIds()];
    if (!this.isCheckedBoitier(this.selectedBoitierId())) {
      selectedBoitiersId.push(this.selectedBoitierId());
    }

    const pathConfigPayload: PathConfigPayload = {
      ...this.pathConfigForm.value,
      boitiersId: selectedBoitiersId
    };

    withToast(this.boitierService.editPathConfig(this.selectedServerId(), pathConfigPayload), this.toastr, this.translate, 'WEB_CONFIG.INIT_CONFIG')
      .subscribe({
        next: () => {
          this.loadingEditPathConfig.set(false);
        },
        error: () => {
          this.loadingEditPathConfig.set(false);
        }
      });
  }

  prepareDBForSingleDevice(idBoitier: number) {
    withToast(this.boitierService.prepareDBForSingleDevise(this.selectedServerId(), idBoitier), this.toastr, this.translate, 'WEB_CONFIG.PREPARE')
      .pipe(
        catchError(() => {
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          this.updateBoitierState(idBoitier);
        }
      });
  }

  updateBoitierState(idBoitier: number) {
    this.boitiers.update(arr => arr.map(boitier => {
      if (boitier.idBoitier == idBoitier) {
        return { ...boitier, etatBoitier: "INSTALLED" };
      }
      return boitier;
    }));
  }


  prepareDB(idServer: number) {
    withToast(this.boitierService.prepareDBForAllDevises(idServer), this.toastr, this.translate, 'WEB_CONFIG.PREPARE').subscribe();
  }

  showDevises(idServer: number) {
    if (!idServer || idServer <= 0) {
      this.toastr.warning(this.translate.instant('WEB_CONFIG.INVALID_SERVER_ID'), this.translate.instant('COMMON.WARNING'));
      return;
    }
    this.selectedServerId.set(idServer);
    this.compteServerService.getAllBoitierofIdcompte(idServer).subscribe({
      next: (res: any) => {
        const responseData = res?.data || res;
        this.boitiers.set(Array.isArray(responseData) ? responseData : []);
        this.boitiersClicked.set(true);
      },
      error: () => {
        this.boitiers.set([]);
        this.boitiersClicked.set(true);
      }
    });
  }

  editBoitier(boitier: Boitier) {
    this.selectedBoitierId.set(boitier.numBoitier); // Use numBoitier for config operations
    this.notifications.set([]);
    this.recalculeP.update(p => ({ ...p, idBoitier: boitier.numBoitier }));
    this.activeTab.set('recalculate');

    // Set form values
    this.recalculateForm.patchValue({
      datestart: new Date(),
      typeRecalcule: 'recalcule trajet'
    });

    this.getDeviceOptionConfig(boitier.numBoitier);
    this.getPathConfig(boitier.numBoitier);
    this.getDeviceSettings(boitier.numBoitier);
    this.loadLastId(boitier.numBoitier);
    this.showConfigModal.set(true);

    if (this.configModal) {
      this.configModal.nativeElement.showModal();
    }
  }

  closeConfigModal() {
    this.showConfigModal.set(false);
    if (this.configModal) {
      this.configModal.nativeElement.close();
    }
  }


  getDeviceOptionConfig(numBoitier: number) {
    this.boitierService.getDeviceOptionConfig(this.ID_COMPTE(), numBoitier)
      .subscribe({
        next: (res: any) => {
          if (res) {
            const responseData = res?.data || res;
            const data = Array.isArray(responseData) ? responseData[0] : responseData;
            if (data) {
              this.deviceOptForm.patchValue({
                useIgnition: !!data.useIgnition,
                useFuel: !!data.useFuel,
                useTemp: !!data.useTemp,
                useFms: !!data.useFms,
                useJ1708: !!data.useJ1708,
                useIdDriver: !!data.useIdDriver,
                useStop: !!data.useStop,
                useDoor: !!data.useDoor,
                useDoor2: !!data.useDoor2
              });
            }
          }
        }
      });
  }


  getPathConfig(numBoitier: number) {
    this.boitierService.getPathConfig(this.ID_COMPTE(), numBoitier)
      .subscribe({
        next: (res: any) => {
          if (res) {
            const responseData = res?.data || res;
            const data = Array.isArray(responseData) ? responseData[0] : responseData;
            if (data) {
              this.pathConfigForm.patchValue(data);
            }
          }
        }
      });
  }


  getDeviceSettings(numBoitier: number) {
    this.boitierService.getDeviceSettings(this.ID_COMPTE(), numBoitier)
      .subscribe({
        next: (res: any) => {
          if (res) {
            const responseData = res?.data || res;
            const data = Array.isArray(responseData) ? responseData[0] : responseData;
            if (data) {
              this.deviceSettingForm.patchValue({
                idIpAdresse: data.idIpAdresse,
                streamId: data.streamId
              });
            }
          }
        }
      });
  }


  editDeviceOptionConfig() {
    this.loadingEditDeviceOption.set(true);
    const selectedBoitiersIdList = [...this.selectedBoitiersIds()];
    if (!this.isCheckedBoitier(this.selectedBoitierId())) {
      selectedBoitiersIdList.push(this.selectedBoitierId());
    }

    const deviceOptPayload = {
      ...this.deviceOptForm.value,
      idBoitiers: selectedBoitiersIdList
    };

    withToast(this.boitierService.editDeviceOptionConfig(this.ID_COMPTE(), deviceOptPayload), this.toastr, this.translate, 'WEB_CONFIG.SAVE_OPTIONS')
      .subscribe({
        next: () => {
          this.loadingEditDeviceOption.set(false);
        },
        error: () => {
          this.loadingEditDeviceOption.set(false);
        }
      });
  }


  recalculeFuel() {
    this.executeRecalculate('WEB_CONFIG.HISTORIC_RECALC', (id, payload) => this.boitierService.recalculeFuel(id, payload));
  }

  recalculeHistorique() {
    this.executeRecalculate('WEB_CONFIG.HISTORIC_RECALC', (id, payload) => this.boitierService.recalculeHistorique(id, payload));
  }

  public recalculeAlert() {
    this.executeRecalculate('WEB_CONFIG.HISTORIC_RECALC', (id, payload) => this.boitierService.recalculeAlert(id, payload));
  }

  recalculePaths() {
    this.executeRecalculate('WEB_CONFIG.HISTORIC_RECALC', (id, payload) => this.boitierService.recalculePaths(id, payload));
  }

  recalculeBoitier() {
    this.executeRecalculate('WEB_CONFIG.HISTORIC_RECALC', (id, payload) => this.boitierService.recalculeBoitier(id, payload), true);
  }

  resetRT() {
    this.executeRecalculate('COMMON.CONFIRM', (id, payload) => this.boitierService.resetRT(id, payload), true);
  }

  private executeRecalculate(
    confirmKey: string,
    serviceCall: (id: number, payload: RecalculatePayload) => Observable<void>,
    useSelectedBoitierId = false
  ) {
    this.notifications.set([]);
    if (confirm(this.translate.instant(confirmKey))) {
      this.loadingRecalculate.set(true);
      const recalculePayload = createRecalculatePayload();
      if (!useSelectedBoitierId) {
        recalculePayload.recalculeStartDate = this.datestart()?.getTime() ?? 0;
      }
      recalculePayload.idBoitiers = [...this.selectedBoitiersIds()];
      const boitierId = useSelectedBoitierId ? this.selectedBoitierId() : this.recalculeP().idBoitier;
      if (!this.isCheckedBoitier(boitierId)) {
        recalculePayload.idBoitiers.push(boitierId);
      }

      serviceCall(this.ID_COMPTE(), recalculePayload).subscribe({
        next: () => this.loadingRecalculate.set(false),
        error: (error) => {
          this.loadingRecalculate.set(false);
          this.notifications.update(n => [...n, { value: error, status: false }]);
        }
      });
    }
  }


  recalculate() {
    const type = this.recalculateForm.get('typeRecalcule')?.value;
    const deviceIds = [...this.selectedBoitiersIds()];
    if (this.recalculeP().idBoitier && !deviceIds.includes(this.recalculeP().idBoitier)) {
      deviceIds.push(this.recalculeP().idBoitier);
    }

    this.updateSqlQuery(type, deviceIds);
    this.showSqlBox = true;

    if (type == "recalcule carburant") {
      this.recalculeFuel();
    } else if (type == "recalcule Temps reel") {
      this.resetRT();
    } else if (type == "recalcule boitier") {
      this.recalculeBoitier();
    } else if (type == "recalcule alert") {
      this.recalculeAlert();
    } else if (type == "recalcule trajet") {
      this.recalculePaths();
    }
  }

  onCheckedBoitier(numBoitier: number): void {
    const index = this.selectedBoitiersIds().indexOf(numBoitier);
    if (index === -1) {
      this.selectedBoitiersIds.update(arr => [...arr, numBoitier]);
    } else {
      this.selectedBoitiersIds.update(arr => arr.filter(id => id !== numBoitier));
    }
  }

  isCheckedBoitier(numBoitier: number): boolean {
    return this.selectedBoitiersIds().includes(numBoitier);
  }


  onCheckedAllBoitiers(): void {
    if (this.boitiers().length == this.selectedBoitiersIds().length) {
      this.selectedBoitiersIds.set([]);
    } else {
      this.selectedBoitiersIds.set(this.boitiers().map(b => b.numBoitier));
    }
  }


  async editDeviceSetting() {
    this.loadingDeviceSetting.set(true);
    const selectedBoitiersIdList = [...this.selectedBoitiersIds()];
    if (!this.isCheckedBoitier(this.selectedBoitierId())) {
      selectedBoitiersIdList.push(this.selectedBoitierId());
    }

    const deviceSetting = {
      ...this.deviceSettingForm.value,
      idBoitiers: selectedBoitiersIdList
    };
    if (!deviceSetting.streamId || deviceSetting.streamId == 0)
      deviceSetting.streamId = deviceSetting.idBoitiers[0];

    withToast(this.boitierService.editDeviceSetting(this.ID_COMPTE(), deviceSetting), this.toastr, this.translate, 'COMMON.SUCCESS')
      .subscribe({
        next: () => {
          this.showDevises(this.serverAccount().idCompteClientServer);
          this.loadingDeviceSetting.set(false);
        },
        error: () => {
          this.loadingDeviceSetting.set(false);
        }
      });
  }


  getSearchDeviceIemi(imei: string) {
    const idIpAdresse = this.deviceSettingForm.get('idIpAdresse')?.value;
    const url = this.ipAddresses().find(ip => ip.idIpAdresse == idIpAdresse)?.urlGetId;
    if (url) {
      this.boitierService.getDeviceIdImei(url, Number.parseInt(imei)).subscribe((res: any) => {
        const responseData = res?.data || res;
        this.deviceSettingForm.patchValue({ streamId: responseData?.id });
      });
    }
  }


  // --- Odometer & Last ID Reset ---
  
  resetOdometre() {
    this.loadingResetOdometre.set(true);
    const selectedBoitiersIdList = [...this.selectedBoitiersIds()];
    if (!this.isCheckedBoitier(this.recalculeP().idBoitier)) {
      selectedBoitiersIdList.push(this.recalculeP().idBoitier);
    }
    this.vehiculeSetting.update(s => ({ ...s, idBoitiers: selectedBoitiersIdList }));

    withToast(this.boitierService.resetOdometre(this.ID_COMPTE(), this.vehiculeSetting()), this.toastr, this.translate, 'WEB_CONFIG.RESET_ODO')
      .subscribe({
        next: () => {
          this.showDevises(this.serverAccount().idCompteClientServer);
          this.loadingResetOdometre.set(false);
        },
        error: () => {
          this.loadingResetOdometre.set(false);
        }
      });
  }

  loadLastId(numBoitier: number) {
    this.boitierService.getLastId(this.ID_COMPTE(), numBoitier)
      .subscribe({
        next: (res: any) => {
          const responseData = res?.data || res;
          this.lastIdForm.patchValue({ lastIdValue: responseData?.lastId || 0 });
        },
        error: () => {
          this.lastIdForm.patchValue({ lastIdValue: 0 });
        }
      });
  }

  resetLastId() {
    this.loadingResetLastId.set(true);
    const selectedBoitiersIdList = [...this.selectedBoitiersIds()];
    if (!this.isCheckedBoitier(this.recalculeP().idBoitier)) {
      selectedBoitiersIdList.push(this.recalculeP().idBoitier);
    }

    const setting = createVehiculeSetting();
    setting.idBoitiers = selectedBoitiersIdList;
    setting.lastId = this.lastIdForm.get('lastIdValue')?.value ?? 0;

    withToast(this.boitierService.resetLastId(this.ID_COMPTE(), setting), this.toastr, this.translate, 'WEB_CONFIG.LAST_ID')
      .subscribe({
        next: () => {
          this.loadingResetLastId.set(false);
        },
        error: () => {
          this.loadingResetLastId.set(false);
        }
      });
  }

  updateSqlQuery(type: string, deviceIds: number[]) {
    const queries: any = {
      'recalcule trajet': [
        'delete from path where device_id = ? and begin_path_time >= ?',
        'delete from stop where device_id = ? and stop_start >= ?',
        'delete from mileage where device_id = ? and start_hour >= ?',
        'delete from activity where device_id = ? and begin_time >= ?',
        'delete from cal_travel where device_id = ?',
        'delete from cal_travel_commit where device_id = ?',
        'insert into cal_travel_commit (device_id) values (?)',
        'insert into cal_travel (device_id) values (?)',
        'update cal_travel set last_id = ?, last_time = ? where device_id = ?',
        'update cal_travel_commit set last_id = ?, last_time = ? where device_id = ?'
      ],
      'recalcule carburant': [
        'delete from rep_fuel_variation where id_device = ? and appro_start_time > ?',
        'delete from cal_option where device_id = ?',
        'delete from cal_option_commit where device_id = ?',
        'insert into cal_option_commit (device_id) values (?)',
        'update cal_option_commit set last_id = 0, last_time = ? where device_id = ?'
      ],
      'recalcule alert': [
        'delete from notification where alertId = ? and created_at >= ?',
        'delete from cal_alert where alert_id = ?',
        'delete from cal_alert_commit where alert_id = ?'
      ],
      'recalcule boitier': [
        'delete from path where device_id = ? and begin_path_time >= ?',
        'delete from stop where device_id = ? and stop_start >= ?',
        'delete from mileage where device_id = ? and start_hour >= ?',
        'delete from rep_overspeed where device_id = ? and begin_path_time >= ?',
        'delete from cal_travel where device_id = ?',
        'delete from cal_travel_commit where device_id = ?'
      ],
      'recalcule Temps reel': [
        'delete from real_time_dev where deviceid = ?'
      ]
    };

    if (!queries[type] || deviceIds.length === 0) {
      this.sqlQuery = '';
      return;
    }

    const deviceId = deviceIds[0];
    const formattedQueries = queries[type].map((query: string) => {
      return query.replace(/\?/g, deviceId.toString());
    });

    this.sqlQuery = formattedQueries.join('\n\n');
  }

}

