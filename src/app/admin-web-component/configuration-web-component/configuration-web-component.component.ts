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
import { WebSocketService } from "../../service/web-socket.service";
import { ToastrService } from "ngx-toastr";
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
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
defineLocale('fr', frLocale);

@Component({
  selector: 'app-configuration-web-component',
  templateUrl: './configuration-web-component.component.html',
  styleUrls: ['./configuration-web-component.component.css'],
  standalone: true,
  imports: [FormsModule, NgFor, BsDatepickerModule, NgMultiSelectDropDownModule, NgIf, NgClass, DatePipe]
})
export class ConfigurationWebComponentComponent implements OnInit {

  ID_COMPTE: number = 0;
  compteWeb: CompteWeb = new CompteWeb();
  serverAccount: CompteServer = new CompteServer();
  serverAccounts: CompteServer[] = [];
  public selected: any[] = [];
  public query = '';
  idCompteServer: number = 0;
  codesPays: { key: string; value: string; }[] = [];
  date: Date | null = new Date();
  options: Option[] = [];
  boitiers: any[] = [];
  boitiersClicked = false;
  public filteredList: any[] = [];
  selectedBoitierId: number = 0;
  selectedServerId: number = 0;
  deviceOpt: DeviceOpt = new DeviceOpt();
  imei: number = 0;
  checked: boolean = false;
  pathConfig = {
    "distanceMinMeter": 10,
    "pathMinSec": 60,
    "pathMinSpeed": 1,
    "pauseMinSec": 60,
    "stopMinSec": 120
  };
  loadingDeviceSetting: boolean = false;
  deviceSetting: DeviceSetting = new DeviceSetting();
  vehiculeSetting: VehiculeSetting = new VehiculeSetting();
  datestart: Date | null = new Date();
  typeRecalcule: string = "";
  recalculeP: RecalculatePayload = new RecalculatePayload();
  selectedIemi: number = 0;
  notifications: { value: string, status: boolean }[] = [];
  loadingRecalculate: boolean = false;
  loadingEditDeviceOption: boolean = false;
  loadingEditPathConfig: boolean = false;
  loadingResetOdometre: boolean = false;
  maxDate: Date = new Date();
  ipAddresses: IpAddress[] = [];
  regions = ['Tunis', 'Sfax', 'Sousse'];
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  dateBoolean: boolean = true;

  dropdownSettings = {};

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly authService = inject(AuthService);
  private readonly boitierService = inject(BoitierService);
  private readonly ipAddressService = inject(IpAddressService);
  private readonly compteServerService = inject(CompteServerService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly localeService = inject(BsLocaleService);

  constructor() {
    this.notifications = [];
    const stompClient = this.webSocketService.connect();
    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/notification', notifications => {
        // Handle notification logic if needed
      });
    });
    this.localeService.use('fr');
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    } else {
      this.route.params.subscribe((params: Params) => {
        this.ID_COMPTE = (+params['idCompteClientWeb']);
        this.webAccountService.getWebAccountById(this.ID_COMPTE).subscribe(async _compteWeb => {
          this.webAccountService.getAllOptions().subscribe(opts => {
            this.options = opts;
            this.charge();
          });
          this.compteWeb = _compteWeb;
          this.serverAccount = _compteWeb.compteClientServer;
          this.selected = _compteWeb.options;
          if (new Date().getTime() < this.serverAccount.date_Expiration) {
            this.serverAccount.expired = false;
            this.serverAccount.during = true;
          } else {
            this.serverAccount.expired = true;
            this.serverAccount.during = false;
          }
          this.date = new Date(this.compteWeb.date_expiration);
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
    this.filteredList = this.options;
  }

  saveChange() {
    this.updateWebAccount();
    this.webAccountService.addOptionsToWebAccount(this.compteWeb.idCompteClientWeb, this.selected).subscribe();
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
    this.loadingEditPathConfig = true;
    const selectedBoitiersId = [...this.numBoitiers];
    if (!this.isCheckedBoitier(this.selectedBoitierId)) {
      selectedBoitiersId.push(this.selectedBoitierId);
    }

    const pathConfigPayload: PathConfigPayload = new PathConfigPayload();
    pathConfigPayload.boitiersId = selectedBoitiersId;
    pathConfigPayload.pathMinSpeed = this.pathConfig.pathMinSpeed;
    pathConfigPayload.pathMinSec = this.pathConfig.pathMinSec;
    pathConfigPayload.stopMinSec = this.pathConfig.stopMinSec;
    pathConfigPayload.pauseMinSec = this.pathConfig.pauseMinSec;
    pathConfigPayload.distanceMinMeter = this.pathConfig.distanceMinMeter;

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
    this.boitierService.prepareDBForAllDevises(idServer).subscribe(res => {
      if (res) {
        this.toastr.success(' Bases de donnees preparee ', 'Preparee!');
      } else {
        this.toastr.error(' Une erreur est survenue ', 'Erreur!')
      }
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
    this.typeRecalcule = "";
    this.datestart = null;
    this.recalculeP = new RecalculatePayload();
    this.notifications = [];
    this.recalculeP.idBoitier = boitier.numBoitier;
    this.getDeviceOptionConfig();
    this.getPathConfig();
    this.getDeviceSettings();
  }

  getDeviceOptionConfig() {
    this.boitierService.getDeviceOptionConfig(this.ID_COMPTE, this.selectedBoitierId)
      .subscribe({
        next: (res) => this.deviceOpt = res,
        error: () => this.toastr.error("Erreur")
      });
  }

  getPathConfig() {
    this.boitierService.getPathConfig(this.ID_COMPTE, this.selectedBoitierId)
      .subscribe({
        next: (res) => this.pathConfig = res,
        error: () => this.toastr.error("Erreur")
      });
  }

  getDeviceSettings() {
    this.boitierService.getDeviceSettings(this.ID_COMPTE, this.selectedBoitierId)
      .subscribe({
        next: (res) => this.deviceSetting = res,
        error: () => this.toastr.error("Erreur")
      });
  }

  editDeviceOptionConfig() {
    this.loadingEditDeviceOption = true;
    const selectedBoitiersId = [...this.numBoitiers];
    if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
      selectedBoitiersId.push(this.recalculeP.idBoitier);
    }
    this.deviceOpt.idBoitiers = selectedBoitiersId;

    this.boitierService.editDeviceOptionConfig(this.ID_COMPTE, this.deviceOpt)
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
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP.idBoitier);
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
    if (this.typeRecalcule == "recalcule carburant") {
      this.recalculeFuel();
    } else if (this.typeRecalcule == "recalcule Temps reel") {
      this.resetRT();
    } else if (this.typeRecalcule == "recalcule boitier") {
      this.recalculeBoitier();
    } else if (this.typeRecalcule == "recalcule alert") {
      this.recalculeAlert();
    } else if (this.typeRecalcule == "recalcule trajet") {
      this.recalculePaths();
    }
  }

  numBoitiers: number[] = [];

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
    if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
      selectedBoitiersId.push(this.recalculeP.idBoitier);
    }

    this.deviceSetting.idBoitiers = selectedBoitiersId;
    if (!this.deviceSetting.streamId || this.deviceSetting.streamId == 0)
      this.deviceSetting.streamId = this.deviceSetting.idBoitiers[0];

    this.boitierService.editDeviceSetting(this.ID_COMPTE, this.deviceSetting).subscribe({
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

  getSearchDeviceIemi(imei: number) {
    let url = this.ipAddresses.find(ip => ip.idIpAdresse == this.deviceSetting.idIpAdresse)?.urlGetId;
    if (url) {
      this.boitierService.getDeviceIdImei(url, imei).subscribe(res => {
        this.deviceSetting.streamId = res.id;
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
