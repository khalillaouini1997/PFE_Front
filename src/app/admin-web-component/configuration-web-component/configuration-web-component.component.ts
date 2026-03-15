import { Component, OnInit, inject, signal, computed } from '@angular/core';
import {
  Boitier,
  CompteServer,
  CompteWeb,
  DeviceOpt,
  Option, PathConfigPayload,
  RecalculatePayload,
  IpAddress,
  VehiculeSetting, DeviceSetting,
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

import { BsLocaleService, BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { defineLocale } from 'ngx-bootstrap/chronos';
import { frLocale } from 'ngx-bootstrap/locale';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule, IDropdownSettings } from 'ng-multiselect-dropdown';
defineLocale('fr', frLocale);

@Component({
    selector: 'app-configuration-web-component',
    templateUrl: './configuration-web-component.component.html',
    styleUrls: ['./configuration-web-component.component.css'],
    imports: [CommonModule, ReactiveFormsModule, BsDatepickerModule, NgSelectModule, NgMultiSelectDropDownModule]
})
export class ConfigurationWebComponentComponent implements OnInit {

  mainConfigForm!: FormGroup;
  recalculateForm!: FormGroup;
  deviceOptForm!: FormGroup;
  pathConfigForm!: FormGroup;
  deviceSettingForm!: FormGroup;
  imeiSearchForm!: FormGroup;

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

  ID_COMPTE = signal<number>(0);
  compteWeb = signal<any>({});
  serverAccount = signal<CompteServer>(new CompteServer());
  serverAccounts = signal<CompteServer[]>([]);
  selected = signal<any[]>([]);
  codesPays = signal<{ key: string; value: string; }[]>([]);
  options = signal<Option[]>([]);
  boitiers = signal<any[]>([]);
  boitiersClicked = signal<boolean>(false);
  selectedBoitierId = signal<number>(0);
  selectedServerId = signal<number>(0);
  loadingDeviceSetting = signal<boolean>(false);
  loadingRecalculate = signal<boolean>(false);
  loadingEditDeviceOption = signal<boolean>(false);
  loadingEditPathConfig = signal<boolean>(false);
  loadingResetOdometre = signal<boolean>(false);
  selectedBoitiersIds = signal<number[]>([]);
  notifications = signal<{ value: string, status: boolean }[]>([]);
  recalculeP = signal<RecalculatePayload>(new RecalculatePayload());
  vehiculeSetting = signal<VehiculeSetting>(new VehiculeSetting());
  ipAddresses = signal<IpAddress[]>([]);
  dropdownSettings = signal<IDropdownSettings>({});
  showConfigModal = signal<boolean>(false);


  date = computed(() => this.mainConfigForm.get('date_expiration')?.value as Date | null);
  checked = computed(() => !!this.mainConfigForm.get('mobileNotif')?.value);
  datestart = computed(() => this.recalculateForm.get('datestart')?.value as Date | null);
  typeRecalcule = computed(() => this.recalculateForm.get('typeRecalcule')?.value as string);
  deviceSetting = computed(() => this.deviceSettingForm.value);
  imei = computed(() => this.imeiSearchForm.get('imei')?.value as string);
  deviceOpt = computed(() => this.deviceOptForm.value);
  pathConfig = computed(() => this.pathConfigForm.value);


  regions = ['Tunis', 'Sfax', 'Sousse'];
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  dateBoolean: boolean = true;
  maxDate: Date = new Date();



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
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    } else {
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
          if (new Date().getTime() < currentServer.date_Expiration) {
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
    }
    this.getAllIps();
    this.dropdownSettings.set({
      singleSelection: false,
      idField: 'idOption',
      textField: 'description',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    });
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
      this.toastr.warning('Please check regular settings form', 'Warning');
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
        tap(() => this.toastr.success('Web account updated', 'Success!')),
        catchError(() => {
          this.toastr.error('Error during update', 'Error!');
          return of(null);
        })
      )
      .subscribe();

    this.webAccountService.addOptionsToWebAccount(this.ID_COMPTE(), formValue.options).subscribe();
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
        tap(() => this.toastr.success('Web account updated', 'Success!')),
        catchError(() => {
          this.toastr.error('There are mistakes here', 'Error!');
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
          this.toastr.success("Configuration de boîtier enregistrée");
        }),
        catchError(error => {
          this.loadingEditPathConfig.set(false);
          this.toastr.error("Modification erronée", 'Erreur!');
          throw error;
        })
      )
      .subscribe();
  }

  prepareDBForSingleDevice(idBoitier: number) {
    this.boitierService.prepareDBForSingleDevise(this.selectedServerId(), idBoitier)
      .pipe(
        tap(() => {
          this.toastr.success("Bases de donnees preparee pour le boitier " + idBoitier, 'Reussi!');
          this.updateBoitierState(idBoitier);
        }),
        catchError(() => {
          this.toastr.error("Une erreur est survenue", 'Erreur!');
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
        this.toastr.success(' Bases de donnees preparee ', 'Preparee!');
      },
      error: () => this.toastr.error(' Une erreur est survenue ', 'Erreur!')
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
    this.showConfigModal.set(true);
  }

  closeConfigModal() {
    this.showConfigModal.set(false);
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
        error: () => this.toastr.error("Erreur options")
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
        error: () => this.toastr.error("Erreur path config")
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
        error: () => this.toastr.error("Erreur settings")
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
          this.toastr.success('Options updated');
        },
        error: () => {
          this.loadingEditDeviceOption.set(false);
          this.toastr.error("Erreur de mise à jour", 'Erreur');
        }
      });
  }


  recalculeFuel() {
    this.notifications.set([]);
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
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
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
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
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
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
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
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
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
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
    if (confirm("Vous êtes sur de vouloir faire le reset ?")) {
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
    return this.selectedBoitiersIds().indexOf(numBoitier) != -1;
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
        this.toastr.success('Paramètres boitier mis à jour');
      },
      error: () => {
        this.loadingDeviceSetting.set(false);
        this.toastr.error("Erreur de mise à jour", 'Erreur');
      }
    });
  }


  getSearchDeviceIemi(imei: string) {
    const idIpAdresse = this.deviceSettingForm.get('idIpAdresse')?.value;
    const url = this.ipAddresses().find(ip => ip.idIpAdresse == idIpAdresse)?.urlGetId;
    if (url) {
      this.boitierService.getDeviceIdImei(url, parseInt(imei)).subscribe(res => {
        this.deviceSettingForm.patchValue({ streamId: res.id });
      });
    }
  }


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
          this.toastr.success('Odometer reset success');
        },
        error: () => {
          this.loadingResetOdometre.set(false);
          this.toastr.error("Erreur de mise à jour", 'Erreur');
        }
      });
  }

}
