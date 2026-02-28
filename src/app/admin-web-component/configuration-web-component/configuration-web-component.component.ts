import { Component, ElementRef, OnInit, inject } from '@angular/core';
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
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
defineLocale('fr', frLocale);

@Component({
  selector: 'app-configuration-web-component',
  templateUrl: './configuration-web-component.component.html',
  styleUrls: ['./configuration-web-component.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BsDatepickerModule, NgMultiSelectDropDownModule]
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

  ID_COMPTE: number = 0;
  compteWeb: any = {};
  serverAccount: CompteServer = new CompteServer();
  serverAccounts: CompteServer[] = [];
  public selected: any[] = [];
  codesPays: { key: string; value: string; }[] = [];
  options: Option[] = [];
  boitiers: any[] = [];
  boitiersClicked = false;
  selectedBoitierId: number = 0;
  selectedServerId: number = 0;
  loadingDeviceSetting: boolean = false;
  loadingRecalculate: boolean = false;
  loadingEditDeviceOption: boolean = false;
  loadingEditPathConfig: boolean = false;
  loadingResetOdometre: boolean = false;
  numBoitiers: number[] = [];
  notifications: { value: string, status: boolean }[] = [];
  recalculeP: RecalculatePayload = new RecalculatePayload();
  vehiculeSetting: VehiculeSetting = new VehiculeSetting();
  ipAddresses: IpAddress[] = [];

  get date(): Date | null { return this.mainConfigForm.get('date_expiration')?.value; }
  get checked(): boolean { return this.mainConfigForm.get('mobileNotif')?.value; }
  get datestart(): Date | null { return this.recalculateForm.get('datestart')?.value; }
  get typeRecalcule(): string { return this.recalculateForm.get('typeRecalcule')?.value; }
  get deviceSetting(): any { return this.deviceSettingForm.value; }
  get imei(): string { return this.imeiSearchForm.get('imei')?.value; }
  get deviceOpt(): any { return this.deviceOptForm.value; }
  get pathConfig(): any { return this.pathConfigForm.value; }

  regions = ['Tunis', 'Sfax', 'Sousse'];
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  dateBoolean: boolean = true;
  maxDate: Date = new Date();

  dropdownSettings = {};

  constructor() {
    this.notifications = [];
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
      idIpAdresse: [''],
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
        this.ID_COMPTE = (+params['idCompteClientWeb']);
        this.webAccountService.getWebAccountById(this.ID_COMPTE).subscribe(async (_compteWeb: any) => {
          this.webAccountService.getAllOptions().subscribe(opts => {
            this.options = opts;
          });
          this.compteWeb = _compteWeb;
          this.serverAccount = _compteWeb.compteClientServer;
          this.selected = _compteWeb.options;

          this.mainConfigForm.patchValue({
            login: _compteWeb.login,
            password: '', // Password is not returned for security
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
            idCompteServer: _compteWeb.compteClientServer?.idCompteClientServer // Map server ID
          });

          if (new Date().getTime() < this.serverAccount.date_Expiration) {
            this.serverAccount.expired = false;
            this.serverAccount.during = true;
          } else {
            this.serverAccount.expired = true;
            this.serverAccount.during = false;
          }
        });
      });
      this.codesPays = this.webAccountService.codesPays;
      this.compteServerService.getAllServerAccountForForm().subscribe(res => {
        this.serverAccounts = res.content;
      });
    }
    this.getAllIps();

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'idOption',
      textField: 'description',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      allowSearchFilter: true
    };
  }

  getAllIps() {
    this.ipAddressService.getAllIps().subscribe(res => {
      this.ipAddresses = res;
    });
  }

  remove(item: any) {
    const index = this.selected.indexOf(item);
    if (index !== -1) {
      this.selected.splice(index, 1);
    }
  }

  charge() {

  }

  saveChange() {
    if (this.mainConfigForm.invalid) {
      this.toastr.warning('Please check regular settings form', 'Warning');
      return;
    }
    const formValue = this.mainConfigForm.value;
    const updatedCompte = {
      ...this.compteWeb,
      ...formValue,
      date_expiration: (formValue.date_expiration as Date).getTime(),
      options: this.selected // Multi-select might still be using this.selected
    };

    this.webAccountService.updateWebAccount(this.ID_COMPTE, updatedCompte)
      .pipe(
        tap(() => this.toastr.success('Web account updated', 'Success!')),
        catchError(() => {
          this.toastr.error('Error during update', 'Error!');
          return of(null);
        })
      )
      .subscribe();

    this.webAccountService.addOptionsToWebAccount(this.ID_COMPTE, this.selected).subscribe();
  }

  updateWebAccount() {
    if (this.date !== null) {
      this.compteWeb.date_expiration = this.date.getTime();
    }
    this.compteWeb.options = this.selected;

    this.webAccountService.updateWebAccount(this.compteWeb.idCompteClientWeb, this.compteWeb)
      .pipe(
        tap(() => this.toastr.success('Web account updated', 'Success!')),
        catchError(() => {
          this.toastr.error('There are mistakes here', 'Error!');
          return of(null);
        })
      )
      .subscribe(updatedCompteWeb => {
        if (updatedCompteWeb) {
          this.compteWeb = updatedCompteWeb;
        }
      });
  }

  getNumberOfNotificationErrors(): number {
    return this.notifications.filter(n => !n.status).length;
  }

  getNumberOfBoitiersNotInstall(): number {
    return this.boitiers.filter(b => b.etatBoitier === 'NOT_INSTALLED').length;
  }

  editPathConfig() {
    if (this.pathConfigForm.invalid) return;
    this.loadingEditPathConfig = true;
    const selectedBoitiersId = [...this.numBoitiers];
    if (!this.isCheckedBoitier(this.selectedBoitierId)) {
      selectedBoitiersId.push(this.selectedBoitierId);
    }

    const pathConfigPayload: PathConfigPayload = {
      ...this.pathConfigForm.value,
      boitiersId: selectedBoitiersId
    };

    this.boitierService.editPathConfig(this.selectedServerId, pathConfigPayload)
      .pipe(
        tap(() => {
          this.loadingEditPathConfig = false;
          this.toastr.success("Configuration de boîtier enregistrée");
        }),
        catchError(error => {
          this.loadingEditPathConfig = false;
          this.toastr.error("Modification erronée", 'Erreur!');
          throw error;
        })
      )
      .subscribe();
  }

  perpareDBForSingleDevice(idBoitier: number) {
    this.boitierService.prepareDBForSingleDevise(this.selectedServerId, idBoitier)
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
    this.boitiers.forEach(boitier => {
      if (boitier.numBoitier == idBoitier) {
        boitier.etatBoitier = "INSTALLED";
      }
    });
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
    this.selectedServerId = idServer;
    this.boitierService.getAllCompteDevises(idServer).subscribe(boitiers => {
      this.boitiers = boitiers;
      this.boitiersClicked = true;
    });
  }

  editBoitier(boitier: Boitier) {
    this.selectedBoitierId = boitier.numBoitier;
    this.recalculateForm.reset({ datestart: new Date(), typeRecalcule: '' });
    this.notifications = [];
    this.recalculeP.idBoitier = boitier.numBoitier;
    this.getDeviceOptionConfig();
    this.getPathConfig();
    this.getDeviceSettings();
  }

  getDeviceOptionConfig() {
    this.boitierService.getDeviceOptionConfig(this.ID_COMPTE, this.selectedBoitierId)
      .subscribe({
        next: (res) => {
          if (res && res.length > 0) {
            this.deviceOptForm.patchValue(res[0]);
          }
        },
        error: () => this.toastr.error("Erreur")
      });
  }

  getPathConfig() {
    this.boitierService.getPathConfig(this.ID_COMPTE, this.selectedBoitierId)
      .subscribe({
        next: (res) => this.pathConfigForm.patchValue(res),
        error: () => this.toastr.error("Erreur")
      });
  }

  getDeviceSettings() {
    this.boitierService.getDeviceSettings(this.ID_COMPTE, this.selectedBoitierId)
      .subscribe({
        next: (res) => {
          if (res && res.length > 0) {
            this.deviceSettingForm.patchValue(res[0]);
          }
        },
        error: () => this.toastr.error("Erreur")
      });
  }

  editDeviceOptionConfig() {
    this.loadingEditDeviceOption = true;
    const selectedBoitiersId = [...this.numBoitiers];
    if (!this.isCheckedBoitier(this.selectedBoitierId)) {
      selectedBoitiersId.push(this.selectedBoitierId);
    }

    const deviceOpt = {
      ...this.deviceOptForm.value,
      idBoitiers: selectedBoitiersId
    };

    this.boitierService.editDeviceOptionConfig(this.ID_COMPTE, deviceOpt)
      .subscribe({
        next: () => {
          this.loadingEditDeviceOption = false;
          this.toastr.success('Options updated');
        },
        error: () => {
          this.loadingEditDeviceOption = false;
          this.toastr.error("Erreur de mise à jour", 'Erreur');
        }
      });
  }

  recalculeFuel() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      this.loadingRecalculate = true;
      const recalculePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart?.getTime() ?? 0;
      recalculePayload.idBoitiers = [...this.numBoitiers];
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.boitierService.recalculeFuel(this.ID_COMPTE, recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate = false,
          error: (error) => {
            this.loadingRecalculate = false;
            this.notifications.push({ value: error, status: false });
          }
        });
    }
  }

  recalculeHistorique() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      this.loadingRecalculate = true;
      const recalculePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart?.getTime() ?? 0;
      recalculePayload.idBoitiers = [...this.numBoitiers];
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.boitierService.recalculeHistorique(this.ID_COMPTE, recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate = false,
          error: (error) => {
            this.loadingRecalculate = false;
            this.notifications.push({ value: error, status: false });
          }
        });
    }
  }

  public recalculeAlert() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      this.loadingRecalculate = true;
      const recalculePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart?.getTime() ?? 0;
      recalculePayload.idBoitiers = [...this.numBoitiers];
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.boitierService.recalculeAlert(this.ID_COMPTE, recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate = false,
          error: (error) => {
            this.loadingRecalculate = false;
            this.notifications.push({ value: error, status: false });
          }
        });
    }
  }

  recalculePaths() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      this.loadingRecalculate = true;
      const recalculePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart?.getTime() ?? 0;
      recalculePayload.idBoitiers = [...this.numBoitiers];
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.boitierService.recalculePaths(this.ID_COMPTE, recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate = false,
          error: (error) => {
            this.loadingRecalculate = false;
            this.notifications.push({ value: error, status: false });
          }
        });
    }
  }

  recalculeBoitier() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le recalcule ?")) {
      this.loadingRecalculate = true;
      const recalculePayload = new RecalculatePayload();
      recalculePayload.idBoitiers = [...this.numBoitiers];
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.boitierService.recalculeBoitier(this.ID_COMPTE, recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate = false,
          error: (error) => {
            this.loadingRecalculate = false;
            this.notifications.push({ value: error, status: false });
          }
        });
    }
  }

  resetRT() {
    this.notifications = [];
    if (confirm("Vous êtes sur de vouloir faire le reset ?")) {
      this.loadingRecalculate = true;
      const recalculePayload = new RecalculatePayload();
      recalculePayload.idBoitiers = [...this.numBoitiers];
      if (!this.isCheckedBoitier(this.selectedBoitierId)) {
        recalculePayload.idBoitiers.push(this.selectedBoitierId);
      }

      this.boitierService.resetRT(this.ID_COMPTE, recalculePayload)
        .subscribe({
          next: () => this.loadingRecalculate = false,
          error: (error) => {
            this.loadingRecalculate = false;
            this.notifications.push({ value: error, status: false });
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
    const index = this.numBoitiers.indexOf(numBoitier);
    index == -1 ? this.numBoitiers.push(numBoitier) : this.numBoitiers.splice(index, 1);
  }

  isCheckedBoitier(numBoitier: number): boolean {
    return this.numBoitiers.indexOf(numBoitier) != -1;
  }

  onCheckedAllBoitiers(): void {
    if (this.boitiers.length == this.numBoitiers.length) {
      this.numBoitiers = [];
    } else {
      this.numBoitiers = this.boitiers.map(b => b.numBoitier);
    }
  }

  async editDeviceSetting() {
    this.loadingDeviceSetting = true;
    const selectedBoitiersId = [...this.numBoitiers];
    if (!this.isCheckedBoitier(this.selectedBoitierId)) {
      selectedBoitiersId.push(this.selectedBoitierId);
    }

    const deviceSetting = {
      ...this.deviceSettingForm.value,
      idBoitiers: selectedBoitiersId
    };
    if (!deviceSetting.streamId || deviceSetting.streamId == 0)
      deviceSetting.streamId = deviceSetting.idBoitiers[0];

    this.boitierService.editDeviceSetting(this.ID_COMPTE, deviceSetting).subscribe({
      next: () => {
        this.showDevises(this.serverAccount.idCompteClientServer);
        this.loadingDeviceSetting = false;
        this.toastr.success('Paramètres boitier mis à jour');
      },
      error: () => {
        this.loadingDeviceSetting = false;
        this.toastr.error("Erreur de mise à jour", 'Erreur');
      }
    });
  }

  getSearchDeviceIemi(imei: string) {
    const idIpAdresse = this.deviceSettingForm.get('idIpAdresse')?.value;
    let url = this.ipAddresses.find(ip => ip.idIpAdresse == idIpAdresse)?.urlGetId;
    if (url) {
      this.boitierService.getDeviceIdImei(url, parseInt(imei)).subscribe(res => {
        this.deviceSettingForm.patchValue({ streamId: res.id });
      });
    }
  }

  resetOdometre() {
    this.loadingResetOdometre = true;
    const selectedBoitiersId = [...this.numBoitiers];
    if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
      selectedBoitiersId.push(this.recalculeP.idBoitier);
    }
    this.vehiculeSetting.idBoitiers = selectedBoitiersId;

    this.boitierService.resetOdometre(this.ID_COMPTE, this.vehiculeSetting)
      .subscribe({
        next: () => {
          this.showDevises(this.serverAccount.idCompteClientServer);
          this.loadingResetOdometre = false;
          this.toastr.success('Odometer reset success');
        },
        error: () => {
          this.loadingResetOdometre = false;
          this.toastr.error("Erreur de mise à jour", 'Erreur');
        }
      });
  }
}
