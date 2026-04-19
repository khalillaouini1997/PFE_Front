import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import {
  Boitier,
  CompteServer,
  Option, PathConfigPayload,
  RecalculatePayload,
  IpAddress,
  VehiculeSetting,
} from "../../data/data";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { WebSocketService } from "../../service/web-socket.service";
import { WebAccountService } from "../../service/web-account.service";
import { AuthService } from "../../service/auth.service";
import { BoitierService } from "../../service/boitier.service";
import { IpAddressService } from "../../service/ip-address.service";
import { CompteServerService } from "../../service/compte-server.service";
import { of, tap } from "rxjs";
import { catchError } from "rxjs/operators";
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BsLocaleService, BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { defineLocale } from 'ngx-bootstrap/chronos';
import { frLocale } from 'ngx-bootstrap/locale';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
defineLocale('fr', frLocale);

import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-configuration-web-component',
    standalone: true,
    templateUrl: './configuration-web-component.component.html',
    styleUrls: ['./configuration-web-component.component.css'],
    imports: [CommonModule, ReactiveFormsModule, BsDatepickerModule, NgSelectModule, NgMultiSelectDropDownModule, TableModule, DatePipe, TranslateModule]
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
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly authService = inject(AuthService);
  private readonly boitierService = inject(BoitierService);
  private readonly ipAddressService = inject(IpAddressService);
  private readonly compteServerService = inject(CompteServerService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly fb = inject(FormBuilder);
  private readonly localeService = inject(BsLocaleService);
  private readonly translate = inject(TranslateService);

  ID_COMPTE = signal<number>(0);
  compteWeb = signal<any>({});
  serverAccount = signal<CompteServer>(new CompteServer());
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
  recalculeP = signal<RecalculatePayload>(new RecalculatePayload());
  vehiculeSetting = signal<VehiculeSetting>(new VehiculeSetting());

  // UI & Modal State
  showConfigModal = signal<boolean>(false);
  loadingRecalculate = signal<boolean>(false);
  loadingEditDeviceOption = signal<boolean>(false);
  loadingEditPathConfig = signal<boolean>(false);
  loadingResetOdometre = signal<boolean>(false);
  loadingResetLastId = signal<boolean>(false);
  loadingDeviceSetting = signal<boolean>(false);
  dropdownSettings: IDropdownSettings = { defaultOpen: false };


  date = computed(() => this.mainConfigForm.get('date_expiration')?.value as Date | null);
  checked = computed(() => !!this.mainConfigForm.get('mobileNotif')?.value);
  datestart = computed(() => this.recalculateForm.get('datestart')?.value as Date | null);
  typeRecalcule = computed(() => this.recalculateForm.get('typeRecalcule')?.value as string);
  deviceSetting = computed(() => this.deviceSettingForm.value);
  imei = computed(() => this.imeiSearchForm.get('imei')?.value as string);
  deviceOpt = computed(() => this.deviceOptForm.value);
  pathConfig = computed(() => this.pathConfigForm.value);


  readonly regions = ['Tunis', 'Sfax', 'Sousse'];
  readonly notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  dateBoolean: boolean = true;
  readonly maxDate: Date = new Date();



  constructor() {
    this.notifications.set([]);
    this.webSocketService.getNotifications().subscribe(_ => { });
    this.localeService.use('fr');
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
      typeRecalcule: ['', Validators.required]
    });

    this.deviceOptForm = this.fb.group({
      useIgnition: [false],
      useFuel: [false],
      useTemp: [false],
      useFms: [false],
      useJ1708: [false],
      useIdDriver: [false],
      useStop: [false]
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
    if (this.authService.isAuthenticated()) {
      this.route.params.subscribe((params: Params) => {
        this.ID_COMPTE.set(+params['idCompteClientWeb']);
        this.webAccountService.getWebAccountById(this.ID_COMPTE()).subscribe(async (_compteWeb: any) => {
          this.webAccountService.getAllOptions().subscribe(opts => {
            this.options.set(opts);
          });
          this.compteWeb.set(_compteWeb);
          this.serverAccount.set(_compteWeb.compteClientServer);
          this.selected.set(_compteWeb.options);

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
            idCompteServer: _compteWeb.compteClientServer?.idCompteClientServer
          });

          const currentServer = this.serverAccount();
          if (Date.now() < currentServer.date_Expiration) {
            this.serverAccount.update(s => ({ ...s, expired: false, during: true }));
          } else {
            this.serverAccount.update(s => ({ ...s, expired: true, during: false }));
          }
        });
      });
      this.codesPays.set(this.webAccountService.codesPays);
      this.compteServerService.getAllServerAccountForForm().subscribe(res => {
        this.serverAccounts.set(res.content);
      });
    } else {
      this.router.navigate(['/error']);
    }
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
    this.ipAddressService.getAllIps().subscribe(res => {
      this.ipAddresses.set(res);
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

    this.webAccountService.updateWebAccount(this.ID_COMPTE(), updatedCompte)
      .pipe(
        tap(() => this.toastr.success(this.translate.instant('WEB_ACCOUNTS.ADD_SUCCESS'), this.translate.instant('COMMON.SUCCESS'))),
        catchError(() => {
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
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
    this.webAccountService.updateWebAccount(currentCompte.idCompteClientWeb, currentCompte)
      .pipe(
        tap(() => this.toastr.success(this.translate.instant('WEB_ACCOUNTS.ADD_SUCCESS'), this.translate.instant('COMMON.SUCCESS'))),
        catchError(() => {
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
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

    this.boitierService.editPathConfig(this.selectedServerId(), pathConfigPayload)
      .pipe(
        tap(() => {
          this.loadingEditPathConfig.set(false);
          this.toastr.success(this.translate.instant('WEB_CONFIG.INIT_CONFIG'), this.translate.instant('COMMON.SUCCESS'));
        }),
        catchError(error => {
          this.loadingEditPathConfig.set(false);
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
          throw error;
        })
      )
      .subscribe();
  }

  prepareDBForSingleDevice(idBoitier: number) {
    this.boitierService.prepareDBForSingleDevise(this.selectedServerId(), idBoitier)
      .pipe(
        tap(() => {
          this.toastr.success(this.translate.instant('WEB_CONFIG.PREPARE') + " " + idBoitier, this.translate.instant('COMMON.SUCCESS'));
          this.updateBoitierState(idBoitier);
        }),
        catchError(() => {
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
          return of(null);
        })
      )
      .subscribe();
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
    this.boitierService.prepareDBForAllDevises(idServer).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('WEB_CONFIG.PREPARE'), this.translate.instant('COMMON.SUCCESS'));
      },
      error: () => this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'))
    });
  }

  showDevises(idServer: number) {
    this.selectedServerId.set(idServer);
    this.boitierService.getAllBoitierofIdcompte(idServer).subscribe(boitiers => {
      this.boitiers.set(boitiers);
      this.boitiersClicked.set(true);
    });
  }


  editBoitier(boitier: Boitier) {
    this.selectedBoitierId.set(boitier.numBoitier); // Use numBoitier for config operations
    this.recalculateForm.reset({ datestart: new Date(), typeRecalcule: '' });
    this.notifications.set([]);
    this.recalculeP.update(p => ({ ...p, idBoitier: boitier.numBoitier })); 
    
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
        next: (res) => {
          if (res) {
            const data = Array.isArray(res) ? res[0] : res;
            if (data) {
              this.deviceOptForm.patchValue({
                useIgnition: !!data.useIgnition,
                useFuel: !!data.useFuel,
                useTemp: !!data.useTemp,
                useFms: !!data.useFms,
                useJ1708: !!data.useJ1708,
                useIdDriver: !!data.useIdDriver,
                useStop: !!data.useStop
              });
            }
          }
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'))
      });
  }


  getPathConfig(numBoitier: number) {
    this.boitierService.getPathConfig(this.ID_COMPTE(), numBoitier)
      .subscribe({
        next: (res) => {
          if (res) {
            const data = Array.isArray(res) ? res[0] : res;
            if (data) {
              this.pathConfigForm.patchValue(data);
            }
          }
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'))
      });
  }


  getDeviceSettings(numBoitier: number) {
    this.boitierService.getDeviceSettings(this.ID_COMPTE(), numBoitier)
      .subscribe({
        next: (res) => {
          if (res) {
            const data = Array.isArray(res) ? res[0] : res;
            if (data) {
              this.deviceSettingForm.patchValue({
                idIpAdresse: data.idIpAdresse,
                streamId: data.streamId
              });
            }
          }
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'))
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

    this.boitierService.editDeviceOptionConfig(this.ID_COMPTE(), deviceOptPayload)
      .subscribe({
        next: () => {
          this.loadingEditDeviceOption.set(false);
          this.toastr.success(this.translate.instant('WEB_CONFIG.SAVE_OPTIONS'), this.translate.instant('COMMON.SUCCESS'));
        },
        error: () => {
          this.loadingEditDeviceOption.set(false);
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
        }
      });
  }


  recalculeFuel() {
    this.notifications.set([]);
    if (confirm(this.translate.instant('WEB_CONFIG.HISTORIC_RECALC'))) {
      this.loadingRecalculate.set(true);
      const recalculePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart()?.getTime() ?? 0;
      recalculePayload.idBoitiers = [...this.selectedBoitiersIds()];
      if (!this.isCheckedBoitier(this.recalculeP().idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP().idBoitier);
      }

      this.boitierService.recalculeFuel(this.ID_COMPTE(), recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate.set(false),
          error: (error) => {
            this.loadingRecalculate.set(false);
            this.notifications.update(n => [...n, { value: error, status: false }]);
          }
        });
    }
  }


  recalculeHistorique() {
    this.notifications.set([]);
    if (confirm(this.translate.instant('WEB_CONFIG.HISTORIC_RECALC'))) {
      this.loadingRecalculate.set(true);
      const recalculePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart()?.getTime() ?? 0;
      recalculePayload.idBoitiers = [...this.selectedBoitiersIds()];
      if (!this.isCheckedBoitier(this.recalculeP().idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP().idBoitier);
      }

      this.boitierService.recalculeHistorique(this.ID_COMPTE(), recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate.set(false),
          error: (error) => {
            this.loadingRecalculate.set(false);
            this.notifications.update(n => [...n, { value: error, status: false }]);
          }
        });
    }
  }


  public recalculeAlert() {
    this.notifications.set([]);
    if (confirm(this.translate.instant('WEB_CONFIG.HISTORIC_RECALC'))) {
      this.loadingRecalculate.set(true);
      const recalculePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart()?.getTime() ?? 0;
      recalculePayload.idBoitiers = [...this.selectedBoitiersIds()];
      if (!this.isCheckedBoitier(this.recalculeP().idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP().idBoitier);
      }

      this.boitierService.recalculeAlert(this.ID_COMPTE(), recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate.set(false),
          error: (error) => {
            this.loadingRecalculate.set(false);
            this.notifications.update(n => [...n, { value: error, status: false }]);
          }
        });
    }
  }


  recalculePaths() {
    this.notifications.set([]);
    if (confirm(this.translate.instant('WEB_CONFIG.HISTORIC_RECALC'))) {
      this.loadingRecalculate.set(true);
      const recalculePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart()?.getTime() ?? 0;
      recalculePayload.idBoitiers = [...this.selectedBoitiersIds()];
      if (!this.isCheckedBoitier(this.recalculeP().idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP().idBoitier);
      }

      this.boitierService.recalculePaths(this.ID_COMPTE(), recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate.set(false),
          error: (error) => {
            this.loadingRecalculate.set(false);
            this.notifications.update(n => [...n, { value: error, status: false }]);
          }
        });
    }
  }

  recalculeBoitier() {
    this.notifications.set([]);
    if (confirm(this.translate.instant('WEB_CONFIG.HISTORIC_RECALC'))) {
      this.loadingRecalculate.set(true);
      const recalculePayload = new RecalculatePayload();
      recalculePayload.idBoitiers = [...this.selectedBoitiersIds()];
      if (!this.isCheckedBoitier(this.recalculeP().idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP().idBoitier);
      }

      this.boitierService.recalculeBoitier(this.ID_COMPTE(), recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate.set(false),
          error: (error) => {
            this.loadingRecalculate.set(false);
            this.notifications.update(n => [...n, { value: error, status: false }]);
          }
        });
    }
  }


  resetRT() {
    this.notifications.set([]);
    if (confirm(this.translate.instant('COMMON.CONFIRM'))) {
      this.loadingRecalculate.set(true);
      const recalculePayload = new RecalculatePayload();
      recalculePayload.idBoitiers = [...this.selectedBoitiersIds()];
      if (!this.isCheckedBoitier(this.selectedBoitierId())) {
        recalculePayload.idBoitiers.push(this.selectedBoitierId());
      }

      this.boitierService.resetRT(this.ID_COMPTE(), recalculePayload)
        .subscribe({
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

    this.boitierService.editDeviceSetting(this.ID_COMPTE(), deviceSetting).subscribe({
      next: () => {
        this.showDevises(this.serverAccount().idCompteClientServer);
        this.loadingDeviceSetting.set(false);
        this.toastr.success(this.translate.instant('COMMON.SUCCESS'), this.translate.instant('COMMON.SUCCESS'));
      },
      error: () => {
        this.loadingDeviceSetting.set(false);
        this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
      }
    });
  }


  getSearchDeviceIemi(imei: string) {
    const idIpAdresse = this.deviceSettingForm.get('idIpAdresse')?.value;
    const url = this.ipAddresses().find(ip => ip.idIpAdresse == idIpAdresse)?.urlGetId;
    if (url) {
      this.boitierService.getDeviceIdImei(url, Number.parseInt(imei)).subscribe(res => {
        this.deviceSettingForm.patchValue({ streamId: res.id });
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

    this.boitierService.resetOdometre(this.ID_COMPTE(), this.vehiculeSetting())
      .subscribe({
        next: () => {
          this.showDevises(this.serverAccount().idCompteClientServer);
          this.loadingResetOdometre.set(false);
          this.toastr.success(this.translate.instant('WEB_CONFIG.RESET_ODO'), this.translate.instant('COMMON.SUCCESS'));
        },
        error: () => {
          this.loadingResetOdometre.set(false);
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
        }
      });
  }

  loadLastId(numBoitier: number) {
    this.boitierService.getLastId(this.ID_COMPTE(), numBoitier)
      .subscribe({
        next: (res) => {
          this.lastIdForm.patchValue({ lastIdValue: res?.lastId ?? 0 });
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

    const setting = new VehiculeSetting();
    setting.idBoitiers = selectedBoitiersIdList;
    setting.lastId = this.lastIdForm.get('lastIdValue')?.value ?? 0;

    this.boitierService.resetLastId(this.ID_COMPTE(), setting)
      .subscribe({
        next: () => {
          this.loadingResetLastId.set(false);
          this.toastr.success(this.translate.instant('WEB_CONFIG.LAST_ID'), this.translate.instant('COMMON.SUCCESS'));
        },
        error: () => {
          this.loadingResetLastId.set(false);
          this.toastr.error(this.translate.instant('COMMON.AN_ERROR_OCCURRED'), this.translate.instant('COMMON.ERROR'));
        }
      });
  }

}

