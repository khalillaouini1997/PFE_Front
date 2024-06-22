import {Component, ElementRef, OnInit} from '@angular/core';
import {
  Boitier,
  CompteServer,
  CompteWeb,
  DeviceOpt,
  Option, PathConfigPayload,
  RecalculatePayload,
  IpAdresse,
  VehiculeSetting, DeviceSetting,
} from "../../data/data";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {WebSocketService} from "../../service/web-socket.service";
import {ToastrService} from "ngx-toastr";
import {CompteWebService} from "../../service/compte-web.service";
import {DashboardService} from "../../service/dashboard.service";
import {DataService} from "../../service/data.service";
import {of, tap} from "rxjs";
import {catchError} from "rxjs/operators";


import {BsLocaleService} from "ngx-bootstrap/datepicker";
import { defineLocale } from 'ngx-bootstrap/chronos';
import { frLocale } from 'ngx-bootstrap/locale';
defineLocale('fr', frLocale);

@Component({
  selector: 'app-configuration-web-component',
  templateUrl: './configuration-web-component.component.html',
  styleUrls: ['./configuration-web-component.component.css']
})
export class ConfigurationWebComponentComponent implements OnInit {

  ID_COMPTE: number = 0;
  compteWeb: CompteWeb = new CompteWeb();
  serverAccount: CompteServer = new CompteServer();
  serverAccounts: CompteServer[];
  public selected: any[] = [];
  public query = '';
  idCompteServer: number = 0;
  codesPays: { key: string; value: string; }[] = [];
  date: Date | null = new Date();
  options: Option[];
  boitiers: any[];
  boitiersClicked = false;
  public filteredList: any[] = [];
  public elementRef: ElementRef;
  selectedBoitierId: number;
  selectedServerId: number;
  deviceOpt: DeviceOpt = new DeviceOpt();
  imei: number;
  checked: boolean;
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
  typeRecalcule: String;
  recalculeP: RecalculatePayload = new RecalculatePayload();
  selectedIemi: number;
  notifications: { value: string, status: boolean }[] = [];
  loadingRecalculate: boolean = false;
  loadingEditDeviceOption: boolean = false;
  loadingEditPathConfig: boolean = false;
  loadingResetOdometre: boolean = false;
  maxDate: Date = new Date();
  ipAddresses: IpAdresse[] = [];
  regions = ['Tunis', 'Sfax', 'Sousse'];
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  dateBoolean: boolean = true;

  dropdownSettings = {};

  constructor(
    private myElement: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private compteWebService: CompteWebService,
    private dashboardService: DashboardService,
    private dataService: DataService,
    private webSocketService: WebSocketService,
    private localeService: BsLocaleService
  ) {
    this.elementRef = myElement;
    this.notifications.splice(0, this.notifications.length);
    const stompClient = this.webSocketService.connect();
    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/notification', notifications => {
        JSON.parse(notifications.body).info;
      });
    });
    this.localeService.use('fr');
  }

  ngOnInit() {
    this.dashboardService.isAuthenticated = this.dashboardService.loadTestAuthenticated();
    if (!this.dashboardService.isAuthenticated) {
      this.router.navigate(['/error']);
    } else {
      this.route.params.subscribe((params: Params) => {
        this.ID_COMPTE = (+params['idCompteClientWeb']);
        this.compteWebService.getWebAccountById(this.ID_COMPTE).subscribe(async _compteWeb => {
          this.options = await this.dataService.getAllOptions().toPromise();
          this.charge();
          this.compteWeb = _compteWeb;
          this.serverAccount = _compteWeb.compteClientServer;
          this.selected = _compteWeb.options; // Ensure this is set correctly
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
      this.codesPays = this.dataService.codesPays;
      this.options = this.dataService.options;
      this.serverAccounts = this.dashboardService.compteServer;
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
    this.dataService.getAllIps().subscribe(res => {
      this.ipAddresses = res;
    });
  }

  remove(item: any) {
    const index = this.selected.indexOf(item);
    if (index !== -1) {
      this.selected.splice(index, 1);
    }
  }

  onItemSelect(item: any) {
    console.log(item);
  }

  onSelectAll(items: any) {
    console.log(items);
  }

  onItemDeselect(item: any) {
    console.log(item);
  }

  onDeselectAll(items: any) {
    console.log(items);
  }

  charge() {
    this.filteredList = this.options;
  }

  saveChange() {
    this.updateWebAccount();
    this.compteWebService.addOptionsToWebAccount(this.compteWeb.idCompteClientWeb, this.selected);
  }

  updateWebAccount() {
    if (this.date !== null) {
      this.compteWeb.date_expiration = this.date.getTime();
    } else {
      throw new Error('this.date is null');
    }

    this.compteWeb.options = this.selected;  // Ensure the selected options are being set

    this.compteWebService.updateWebAccount(this.compteWeb.idCompteClientWeb, this.compteWeb)
      .pipe(
        tap(_compteWeb => this.toastr.success('Web account updated', 'Success!')),
        catchError(error => {
          this.toastr.error('There are mistakes here', 'Error!');
          return of(null); // Return observable to prevent further errors
        })
      )
      .subscribe(updatedCompteWeb => {
        if (updatedCompteWeb) {
          this.compteWeb = updatedCompteWeb; // Ensure local state is updated
        }
      });
  }


  getNumberOfNotificationErrors(): number {
    return this.notifications.filter(n => !n.status).length;
  }

  getNumberOfBoitiersNotInstall(): number {
    return this.boitiers.filter(b => b.etatBoitier === 'NOT_INSTALLED').length;
  }


  //=========================================
  //    Change serve account of Web account
  //=========================================

  /*ChangeServerAccount() {
    if (this.serverAccount.idCompteClientServer != this.idCompteServer) {
      this.compteWebService.associateCompteWebToCompteServer(this.ID_COMPTE, this.idCompteServer)
        .pipe(
          tap(_newServer => {
            this.serverAccount = _newServer;
            this.updateServerAccountStatus(_newServer); // Separate logic for clarity
          }),
          catchError(error => {
            this.toastr.error('There are mistakes here', 'Error!');
            throw error; // Re-throw for potential global error handling
          })
        )
        .subscribe();
    } else {
      this.toastr.success('Server of this web account is not modified', 'Success!');
    }
  }*/

// Helper function for clarity
  updateServerAccountStatus(_newServer: any) {
    if (new Date().getTime() < _newServer.date_Expiration) {
      _newServer.expired = false;
      _newServer.during = true;
    } else {
      _newServer.expired = true;
      _newServer.during = false;
    }
  }


  editPathConfig() {
    this.loadingEditPathConfig = true;

    const selectedBoitiersId: number[] = [];
    for (let numBoitier of this.numBoitiers) {
      selectedBoitiersId.push(numBoitier);
    }
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

    this.compteWebService.editPathConfig(this.selectedServerId, pathConfigPayload)
      .pipe(
        tap(() => {
          this.loadingEditPathConfig = false;
          this.toastr.success("Configuration de boîtier enregistrée");
        }),
        catchError(error => {
          this.loadingEditPathConfig = false;
          this.toastr.error("Modification erronée", 'Erreur!');
          throw error; // Re-throw for potential global error handling
        })
      )
      .subscribe();
  }

  perpareDBForSingleDevice(idBoitier: number) {
    this.dataService.prepareDBForSingleDevise(this.selectedServerId, idBoitier)
      .pipe(
        tap(() => {
          this.toastr.success("Bases de donnees preparee pour le boitier " + idBoitier, 'Reussi!');
          this.updateBoitierState(idBoitier); // Separate logic for clarity
        }),
        catchError(error => {
          this.toastr.error("Une erreur est survenue", 'Erreur!');
          throw error; // Re-throw for potential global error handling
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
    this.dataService.prepareDBForAllDevises(idServer).subscribe(res => {
      if (res == true) {
        this.toastr.success(' Bases de donnees preparee ', 'Preparee!');
      } else {
        this.toastr.error(' Une erreur est survenue ', 'Erreur!')
      }
    });
  }

  showDevises(idServer: number) {
    this.selectedServerId = idServer;
    this.dataService.getAllCompteDevises(idServer).subscribe(boitiers => {
      this.boitiers = boitiers;
      this.boitiersClicked = true;
    });
  }

  editBoitier(boitier: Boitier) {
    this.selectedBoitierId = boitier.numBoitier;
    this.typeRecalcule = ""
    this.datestart = null;
    this.recalculeP = new RecalculatePayload();
    this.notifications.splice(0, this.notifications.length);

    this.recalculeP.idBoitier = boitier.numBoitier;
    this.getDeviceOptionConfig();
    this.getPathConfig();
    this.getDeviceSettings();
  }
  getDeviceOptionConfig() {
    this.dataService.getDeviceOptionConfig(this.ID_COMPTE, this.selectedBoitierId)
      .pipe(
        tap(res => this.deviceOpt = res), // Update deviceOpt without altering the observable stream
        catchError(error => {
          this.toastr.error("Erreur");
          throw error; // Re-throw for potential global error handling
        })
      )
      .subscribe();
  }

  getPathConfig() {
    this.dataService.getPathConfig(this.ID_COMPTE, this.selectedBoitierId)
      .pipe(
        tap(res => this.pathConfig = res), // Update pathConfig without altering the observable stream
        catchError(error => {
          this.toastr.error("Erreur");
          throw error; // Re-throw for potential global error handling
        })
      )
      .subscribe();
  }

  getDeviceSettings() {
    this.dataService.getDeviceSettings(this.ID_COMPTE, this.selectedBoitierId)
      .pipe(
        tap(res => this.deviceSetting = res), // Update deviceSetting without altering the observable stream
        catchError(error => {
          this.toastr.error("Erreur");
          throw error; // Re-throw for potential global error handling
        })
      )
      .subscribe();
  }


  editDeviceOptionConfig() {
    this.loadingEditDeviceOption = true;

    const selectedBoitiersId = [...this.numBoitiers]; // Concisely copy numBoitiers array
    if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
      selectedBoitiersId.push(this.recalculeP.idBoitier);
    }

    this.deviceOpt.idBoitiers = selectedBoitiersId;

    this.dataService.editDeviceOptionConfig(this.ID_COMPTE, this.deviceOpt)
      .pipe(
        tap(() => this.loadingEditDeviceOption = false), // Update loading state after successful update
        catchError(error => {
          this.loadingEditDeviceOption = false;
          this.toastr.error("Erreur de mise à jour", 'Erreur');
          throw error; // Re-throw for potential global error handling
        })
      )
      .subscribe();
  }

  recalculeFuel() {
    this.notifications.splice(0, this.notifications.length);

    const confirmed = confirm("Vous êtes sur de vouloir faire le recalcule ?");

    if (confirmed) {
      this.loadingRecalculate = true;

      const recalculePaths = new RecalculatePayload();
      recalculePaths.recalculeStartDate = this.datestart?.getTime() ?? 0; // Handle potential null datestart
      recalculePaths.idBoitiers = [...this.numBoitiers]; // Copy numBoitiers array
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePaths.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.recalculeFuel(this.ID_COMPTE, recalculePaths)
        .pipe(
          tap(() => this.loadingRecalculate = false), // Set loading state after success or error
          catchError(error => {
            this.notifications.push({ value: error, status: false });
            throw error; // Re-throw for global error handling
          })
        )
        .subscribe();
    }
  }

  recalculeHistorique() {
    this.notifications.splice(0, this.notifications.length);

    const confirmed = confirm("Vous êtes sur de vouloir faire le recalcule ?");

    if (confirmed) {
      this.loadingRecalculate = true;

      const recalculePaths = new RecalculatePayload();
      recalculePaths.recalculeStartDate = this.datestart?.getTime() ?? 0; // Handle potential null datestart
      recalculePaths.idBoitiers = [...this.numBoitiers]; // Copy numBoitiers array
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePaths.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.recalculeHistorique(this.ID_COMPTE, recalculePaths)
        .pipe(
          tap(() => this.loadingRecalculate = false), // Set loading state after success or error
          catchError(error => {
            this.notifications.push({ value: error, status: false });
            throw error; // Re-throw for global error handling
          })
        )
        .subscribe();
    }
  }

  public recalculeAlert() {
    this.notifications.splice(0, this.notifications.length);

    const confirmed = confirm("Vous êtes sur de vouloir faire le recalcule ?");

    if (confirmed) {
      this.loadingRecalculate = true;

      const recalculePaths = new RecalculatePayload();
      recalculePaths.recalculeStartDate = this.datestart?.getTime() ?? 0; // Handle potential null datestart
      recalculePaths.idBoitiers = [...this.numBoitiers]; // Copy numBoitiers array
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePaths.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.recalculeAlert(this.ID_COMPTE, recalculePaths)
        .pipe(
          tap(() => this.loadingRecalculate = false), // Set loading state after success or error
          catchError(error => {
            this.notifications.push({ value: error, status: false });
            throw error; // Re-throw for potential global error handling
          })
        )
        .subscribe();
    }
  }


  recalculePaths() {
    this.notifications.splice(0, this.notifications.length);

    const confirmed = confirm("Vous êtes sur de vouloir faire le recalcule ?");

    if (confirmed) {
      this.loadingRecalculate = true;

      const recalculePaths = new RecalculatePayload();
      recalculePaths.recalculeStartDate = this.datestart?.getTime() ?? 0; // Handle potential null datestart
      recalculePaths.idBoitiers = [...this.numBoitiers]; // Copy numBoitiers array
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePaths.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.recalculePaths(this.ID_COMPTE, recalculePaths)
        .pipe(
          tap(() => this.loadingRecalculate = false), // Set loading state after success or error
          catchError(error => {
            this.notifications.push({ value: error, status: false });
            throw error; // Re-throw for potential global error handling
          })
        )
        .subscribe();
    }
  }


  recalculeBoitier() {
    this.notifications.splice(0, this.notifications.length);

    const confirmed = confirm("Vous êtes sur de vouloir faire le recalcule ?");

    if (confirmed) {
      this.loadingRecalculate = true;

      const recalculePaths = new RecalculatePayload();
      recalculePaths.idBoitiers = [...this.numBoitiers]; // Copy numBoitiers array
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePaths.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.recalculeBoitier(this.ID_COMPTE, recalculePaths)
        .pipe(
          tap(() => this.loadingRecalculate = false), // Set loading state after success or error
          catchError(error => {
            this.notifications.push({ value: error, status: false });
            throw error; // Re-throw for potential global error handling
          })
        )
        .subscribe();
    }
  }


  resetRT() {
    this.notifications.splice(0, this.notifications.length);

    const confirmed = confirm("Vous êtes sur de vouloir faire le reset ?");

    if (confirmed) {
      this.loadingRecalculate = true;

      const recalculePaths = new RecalculatePayload();
      recalculePaths.idBoitiers = [...this.numBoitiers]; // Copy numBoitiers array
      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePaths.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.resetRT(this.ID_COMPTE, recalculePaths)
        .pipe(
          tap(() => this.loadingRecalculate = false), // Set loading state after success or error
          catchError(error => {
            this.notifications.push({ value: error, status: false });
            throw error; // Re-throw for potential global error handling
          })
        )
        .subscribe();
    }
  }


  recalculate() {
    if (this.typeRecalcule == "recalcule carburant") {
      this.recalculeFuel();
    }

    if (this.typeRecalcule == "recalcule Temps reel") {
      !this.dateBoolean;
      this.resetRT();
    }

    if (this.typeRecalcule == "recalcule boitier") {
      !this.dateBoolean;
      this.recalculeBoitier();
    }

    if (this.typeRecalcule == "recalcule alert") {
      this.recalculeAlert();
    }

    if (this.typeRecalcule == "recalcule trajet") {
      this.recalculePaths();
    }
  }


  /** multiple processing */

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
      this.numBoitiers = [];
      for (let boitier of this.boitiers) {
        this.numBoitiers.push(boitier.numBoitier);
      }
    }
  }

  /**
   * edit device setting
   */
  async editDeviceSetting() {
    this.loadingDeviceSetting = true;

    const selectedBoitiersId: number[] = [];

    for (let numBoitier of this.numBoitiers) {
      selectedBoitiersId.push(numBoitier);
    }

    if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
      selectedBoitiersId.push(this.recalculeP.idBoitier);
    }

    this.deviceSetting.idBoitiers = selectedBoitiersId;
    if (!this.deviceSetting.streamId || this.deviceSetting.streamId == 0)
      this.deviceSetting.streamId = this.deviceSetting.idBoitiers[0];

    try {
      this.dataService.editDeviceSetting(this.ID_COMPTE, this.deviceSetting);
      this.showDevises(this.serverAccount.idCompteClientServer);
      this.loadingDeviceSetting = false;
      this.toastr.success('Paramètres boitier est mis à jour');
    } catch (error) {
      this.loadingDeviceSetting = false;
      this.toastr.error("Erreur de mise à jour", 'Erreur');
    }
  }


  getSearchDeviceIemi(imei: number) {
    let url: string | null = null; // Initialize url as null
    for (let ip of this.ipAddresses) {
      if (ip.idIpAdresse == this.deviceSetting.idIpAdresse) {
        url = ip.urlGetId;
        break; // Exit the loop once url is found
      }
    }
    console.log("res => " + url);
    if (url !== null) {
      this.dataService.getDeviceIdImei(url, imei).subscribe(res => {
        console.log("res => " + res.id);
        this.deviceSetting.streamId = res.id;
        console.log("res => " + res.id);
      });
    } else {
      console.error("URL is null.");
    }
  }



  resetOdometre() {
    this.loadingResetOdometre = true;

    const selectedBoitiersId = [...this.numBoitiers]; // Concisely copy numBoitiers array
    if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
      selectedBoitiersId.push(this.recalculeP.idBoitier);
    }

    this.vehiculeSetting.idBoitiers = selectedBoitiersId;

    this.dataService.resetOdometre(this.ID_COMPTE, this.vehiculeSetting)
      .pipe(
        tap(() => {
          this.showDevises(this.serverAccount.idCompteClientServer);
          this.loadingResetOdometre = false;
        }), // Update loading state and potentially show devises after success
        catchError(error => {
          this.loadingResetOdometre = false;
          this.toastr.error("Erreur de mise à jour", 'Erreur');
          throw error; // Re-throw for potential global error handling
        })
      )
      .subscribe();
  }


}
