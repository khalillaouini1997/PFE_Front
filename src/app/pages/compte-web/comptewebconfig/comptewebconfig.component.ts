import {Component, ElementRef, OnInit, ViewContainerRef} from '@angular/core';
import {
  Boitier,
  CompteWeb,
  DeviceOpt,
  DeviceSetting,
  Option,
  PathConfigPayload,
  RecalculatePayload,
  VehiculeSetting
} from 'src/app/data/data';
import {CompteServer} from "../../../data/data";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {BsLocaleService} from "ngx-bootstrap/datepicker";
import {WebSocketService} from "../../../service/web-socket.service";
import {CompteWebService} from "../../../service/compte-web.service";
import {DashboardService} from "../../../service/dashboard.service";
import {DataService} from "../../../service/data.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-comptewebconfig',
  templateUrl: './comptewebconfig.component.html',
  styleUrls: ['./comptewebconfig.component.scss']
})
export class ComptewebconfigComponent implements OnInit {

  ID_COMPTE: number = 0;
  compteWeb: CompteWeb = new CompteWeb();
  serverAccount: CompteServer = new CompteServer();
  serverAccounts: CompteServer[];
  public selected: Option[] = []; // Explicitly specify the type as Option[]
  public query = '';
  idCompteServer: number = 0;
  codesPays: { key: string; value: string; }[] = [];
  date: Date | null = null;
  options: Option[];
  boitiers: any[];
  boitiersClicked = false;
  filteredList: Option[] = []; // Explicitly specifying the type as Option[]
  public elementRef;
  selectedBoitierId: number;
  selectedServerId: number;
  //Init database variable

  deviceOpt: DeviceOpt = new DeviceOpt();
  imei: number;
  checked: boolean;
  pathConfig = {
    "pathMinSpeed": 1,
    "pathMinSec": 60,
    "stopMinSec": 120,
    "pauseMinSec": 60,
    "distanceMinMeter": 10
  };

  loadingDeviceSetting: boolean = false;
  deviceSetting: DeviceSetting = new DeviceSetting();
  vehiculeSetting: VehiculeSetting = new VehiculeSetting();

  datestart: Date | null = null;
  typeRecalcule: String;
  recalculeP: RecalculatePayload = new RecalculatePayload();

  selectedIemi: number;
  /**
   * Array notification
   */
  notifications: { value: string, status: boolean }[] = [];


  /**
   * Loading
   */
  loadingRecalculate: boolean = false;
  loadingEditDeviceOption: boolean = false;
  loadingEditPathConfig: boolean = false;
  loadingResetOdometre: boolean = false;

  maxDate: Date = new Date();

  /**
   * addresse ip
   */
  ipAddresses = [];

  //select periode
  regions = ['Tunis', 'Sfax', 'Sousse'];

  //select periode
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];

  dateBoolean: boolean = true;
  constructor(myElement: ElementRef, private route: ActivatedRoute,
              private dataService: DataService,
              private compteWebService: CompteWebService,
              private dashboardService: DashboardService,
              private webSocketService: WebSocketService,
              private router: Router, public toastr: ToastrService,
              vcr: ViewContainerRef, private localeService: BsLocaleService,) {
    this.elementRef = myElement;
    this.toastr.success('This is a success message!', 'Success'); // Type, Title (optional)
    this.notifications.splice(0, this.notifications.length);
    // Open connection with server socket
    let stompClient = this.webSocketService.connect();
    stompClient.connect({}, (frame: any) => {
      stompClient.subscribe('/topic/notification', (notifications: any) => {
        var notificationsInfo: string = typeof notifications.body !== 'undefined' ? JSON.parse(notifications.body).info : '';
        var status: boolean = false;

        if (notificationsInfo.split("----").pop()?.toLowerCase() === 'successfully') {
          status = true;
        }

        this.notifications.push({value: notificationsInfo.split("----").shift() ?? '', status: status});
      });
    });

    this.localeService.use('fr');
  }

    getNumberOfNotificationErrors(): number {
    return this.notifications.filter(n => n.status === false).length;
  }

  getNumberOfBoitiersNotInstall(): number {
    return this.boitiers.filter(b => b.etatBoitier === 'NOT_INSTALLED').length;
  }


  //=====================================
  //    charge information for form
  //=====================================

  ngOnInit() {
    this.dashboardService.isAuthenticated = this.dashboardService.loadTestAuthenticated();
    if (this.dashboardService.isAuthenticated == false) {
      this.router.navigate(['/error']);
    } else {
      this.route.params.subscribe((params: Params) => {
        this.ID_COMPTE = (+params['idCompteClientWeb']);
        this.compteWebService.getWebAccountById(this.ID_COMPTE).subscribe(_compteWeb => {
          //web account
          this.compteWeb = _compteWeb;
          //server account from web account
          this.serverAccount = _compteWeb.compteClientServer;
          //options
          this.selected = _compteWeb.options;

          if (new Date().getTime() < this.serverAccount.date_Expiration) {

            this.serverAccount.expired = false;
            this.serverAccount.during = true;
          } else {
            this.serverAccount.expired = true;
            this.serverAccount.during = false;
          }
          this.date = new Date(this.compteWeb.date_expiration);
        })
      });

      this.codesPays = this.dataService.codesPays;
      this.options = this.dashboardService.options;
      this.serverAccounts = this.dashboardService.compteServer;

    }

    this.getAllIps();
  }

  getAllIps() {
    this.dataService.getAllIps().subscribe(res => {
      this.ipAddresses = res;
    });
  }


  //=====================================
  //    for multiple select Options
  //=====================================

  remove(item: any) {
    this.selected.splice(this.selected.indexOf(item), 1);
  }

  select(item: any) {
    if (this.selected.findIndex((x: any) => x.idOption == item.idOption) == -1) {
      this.selected.push(item);
    }

    this.query = '';
    this.filteredList = [];
  }

  filter() {
    if (this.query && this.query.trim() !== "") {
      this.filteredList = this.options.filter((el: Option) => {
        return el.description.toLowerCase().includes(this.query.toLowerCase());
      });
    } else {
      this.filteredList = [];
    }
  }

  charge() {
    this.filteredList = this.options.slice(); // Copy the options array
  }



  //=====================================================
  //   save changes (update web account + save options )
  //=====================================================

  saveChange() {
    this.updateWebAccount();
    this.compteWebService.addOptionsToWebAccount(this.compteWeb.idCompteClientWeb, this.selected);
  }

  //=====================================
  //    update Web account
  //=====================================

  updateWebAccount() {
    if (this.date) {
      this.compteWeb.date_expiration = this.date.getTime();

      this.compteWebService.updateWebAccount(this.compteWeb.idCompteClientWeb, this.compteWeb)
        .subscribe(
          _compteWeb => {
            this.toastr.success('Web account updated', 'Success!');
          },
          error => {
            this.toastr.error('There is a mistake here', 'Error!');
          }
        );
    } else {
      // Handle the case when this.date is null
      console.error('this.date is null');
    }
  }



  //=========================================
  //    Change serve account of Web account
  //=========================================

  ChangeServerAccount() {
    if (this.serverAccount.idCompteClientServer != this.idCompteServer) {
      this.compteWebService.associateCompteWebToCompteServer(this.ID_COMPTE, this.idCompteServer).subscribe(_newServer => {
        this.serverAccount = _newServer;
        if (new Date().getTime() < this.serverAccount.date_Expiration) {

          this.serverAccount.expired = false;
          this.serverAccount.during = true;
        } else {
          this.serverAccount.expired = true;
          this.serverAccount.during = false;
        }
        this.toastr.success(' server of this web account is updated ', 'Success!')
      }, error => this.toastr.error(' There are mistake here ', 'Error!'))
    }
    else {
      this.toastr.success(' server of this web account is Not Modified', 'Success!')
    }
  }

  editPathConfig() {

    this.loadingEditPathConfig = true;

    var selectedBoitiersId: number[] = [];

    var pathConfigPayload: PathConfigPayload = new PathConfigPayload();

    for (let numBoitier of this.numBoitiers) {
      selectedBoitiersId.push(numBoitier);
    }

    if (!this.isCheckedBoitier(this.selectedBoitierId)) {
      selectedBoitiersId.push(this.selectedBoitierId);
    }

    pathConfigPayload.boitiersId = selectedBoitiersId;


    pathConfigPayload.pathMinSpeed = this.pathConfig.pathMinSpeed;
    pathConfigPayload.pathMinSec = this.pathConfig.pathMinSec;
    pathConfigPayload.stopMinSec = this.pathConfig.stopMinSec;
    pathConfigPayload.pauseMinSec = this.pathConfig.pauseMinSec;
    pathConfigPayload.distanceMinMeter = this.pathConfig.distanceMinMeter;


    this.compteWebService.editPathConfig(this.selectedServerId, pathConfigPayload).subscribe(rep => {
      this.loadingEditPathConfig = false;
      this.toastr.success("Configuration de boîtier enregistrée");
    }, error => {
      this.loadingEditPathConfig = false;
      this.toastr.error("Modification erronée", 'Erreur!');
    });
  }

  perpareDBForSingleDevice(idBoitier: number) {
    this.dataService.prepareDBForSingleDevise(this.selectedServerId, idBoitier).subscribe(rep => {
      this.toastr.success("Bases de donnees preparee pour le boitier " + idBoitier, 'Reussi!');
      this.boitiers.forEach(boitier => {
        if (boitier.numBoitier == idBoitier) {
          boitier.etatBoitier = "INSTALLED";
        }
      });
    }, error => { this.toastr.error("Une erreur est survenue", 'Erreur!'); });
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

    this.dataService.getDeviceOptionConfig(this.ID_COMPTE, this.selectedBoitierId).subscribe(res => {
      this.deviceOpt = res;
    }, error => {
      this.toastr.error("Erreur");
    })
  }

  getPathConfig() {
    this.dataService.getPathConfig(this.ID_COMPTE, this.selectedBoitierId).subscribe(res => {
      this.pathConfig = res;
    }, error => {
      this.toastr.error("Erreur");
    })
  }

  getDeviceSettings() {
    this.dataService.getDeviceSettings(this.ID_COMPTE, this.selectedBoitierId).subscribe(res => {
      this.deviceSetting = res;
    }, error => {
      this.toastr.error("Erreur");
    })
  }

  editDeviceOptionConfig() {
    this.loadingEditDeviceOption = true;

    var selectedBoitiersId: number[] = [];

    for (let numBoitier of this.numBoitiers) {
      selectedBoitiersId.push(numBoitier);
    }

    if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
      selectedBoitiersId.push(this.recalculeP.idBoitier);
    }

    this.deviceOpt.idBoitiers = selectedBoitiersId;

    this.dataService.editDeviceOptionConfig(this.ID_COMPTE, this.deviceOpt).subscribe(res => {
      this.loadingEditDeviceOption = false;
      this.toastr.success('Options device est mis à jour');
    }, error => {
      this.loadingEditDeviceOption = false;
      this.toastr.error("Erreur de mise à jour", 'Erreur');
    })
  }
  public recalculeFuel() {
    this.notifications.splice(0, this.notifications.length);

    let res = confirm("Êtes-vous sûr de vouloir recalculer ?");
    if (res) {
      this.loadingRecalculate = true;

      let recalculePayload: RecalculatePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart?.getTime() || 0;

      for (let numBoitier of this.numBoitiers) {
        recalculePayload.idBoitiers.push(numBoitier);
      }

      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.recalculeFuel(this.ID_COMPTE, recalculePayload).subscribe(
        res => {
          this.loadingRecalculate = false;
        },
        error => {
          this.loadingRecalculate = false;
          this.notifications.push({ value: error, status: false });
        }
      );
    }
  }

  public recalculeHistorique() {
    this.notifications.splice(0, this.notifications.length);

    let res = confirm("Êtes-vous sûr de vouloir recalculer ?");
    if (res) {
      this.loadingRecalculate = true;

      let recalculePayload: RecalculatePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart?.getTime() || 0;

      for (let numBoitier of this.numBoitiers) {
        recalculePayload.idBoitiers.push(numBoitier);
      }

      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.recalculeHistorique(this.ID_COMPTE, recalculePayload).subscribe(
        res => {
          this.loadingRecalculate = false;
        },
        error => {
          this.loadingRecalculate = false;
          this.notifications.push({ value: error, status: false });
        }
      );
    }
  }

  public recalculeAlert() {
    this.notifications.splice(0, this.notifications.length);

    let resp = confirm('Êtes-vous sûr de vouloir recalculer ?');

    if (resp) {
      this.loadingRecalculate = true;

      let recalculePayload: RecalculatePayload = new RecalculatePayload();
      recalculePayload.recalculeStartDate = this.datestart?.getTime() || 0;

      for (let numBoitier of this.numBoitiers) {
        recalculePayload.idBoitiers.push(numBoitier);
      }

      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePayload.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.recalculeAlert(this.ID_COMPTE, recalculePayload).subscribe(
        res => {
          this.loadingRecalculate = false;
        },
        error => {
          this.loadingRecalculate = false;
          this.notifications.push({ value: error, status: false });
        }
      );
    }
  }


  recalculePaths() {
    this.notifications.splice(0, this.notifications.length);

    let resp = confirm('Vous êtes sur de vouloir faire le recalcule ?');

    if (resp) {
      this.loadingRecalculate = true;

      var recalculePaths: RecalculatePayload = new RecalculatePayload();

      if (this.datestart) { // Null check for this.datestart
        recalculePaths.recalculeStartDate = this.datestart.getTime();
      } else {
        // Handle the case when this.datestart is null or undefined
        // For example, you can set a default value or show an error message
      }

      for (let numBoitier of this.numBoitiers) {
        recalculePaths.idBoitiers.push(numBoitier);
      }

      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePaths.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.recalculePaths(this.ID_COMPTE, recalculePaths).subscribe(res => {
        this.loadingRecalculate = false;
      }, error => {
        this.loadingRecalculate = false;
        this.notifications.push({ value: error, status: false });
      });
    }
  }


  recalculeBoitier() {
    this.notifications.splice(0, this.notifications.length);

    let resp = confirm('Vous êtes sur de vouloir faire le recalcule ?');

    if (resp) {

      this.loadingRecalculate = true;

      var recalculePaths: RecalculatePayload = new RecalculatePayload();

      for (let numBoitier of this.numBoitiers) {
        recalculePaths.idBoitiers.push(numBoitier);
      }

      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePaths.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.recalculeBoitier(this.ID_COMPTE, recalculePaths).subscribe(res => {
        this.loadingRecalculate = false;
      }, error => {
        this.loadingRecalculate = false;
        this.notifications.push({ value: error, status: false });
      });
    }
  }

  resetRT() {
    this.notifications.splice(0, this.notifications.length);

    let resp = confirm('Vous êtes sur de vouloir faire le recalcule ?');

    if (resp) {

      this.loadingRecalculate = true;

      var recalculePaths: RecalculatePayload = new RecalculatePayload();

      for (let numBoitier of this.numBoitiers) {
        recalculePaths.idBoitiers.push(numBoitier);
      }

      if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
        recalculePaths.idBoitiers.push(this.recalculeP.idBoitier);
      }

      this.dataService.resetRT(this.ID_COMPTE, recalculePaths).subscribe(res => {
        this.loadingRecalculate = false;
      }, error => {
        this.loadingRecalculate = false;
        this.notifications.push({ value: error, status: false });
      });
    }
  }

  recalculate() {
    if (this.typeRecalcule == "recalcule carburant") {
      this.recalculeFuel();
    }

    if (this.typeRecalcule == "recalcule Temps reel") {
      this.dateBoolean == false;
      this.resetRT();
    }

    if (this.typeRecalcule == "recalcule boitier") {
      this.dateBoolean == false;
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
    var index = this.numBoitiers.indexOf(numBoitier);
    index == -1 ? this.numBoitiers.push(numBoitier) : this.numBoitiers.splice(index, 1);
  }

  isCheckedBoitier(numBoitier: number): boolean {
    if (this.numBoitiers.indexOf(numBoitier) == -1) {
      return false;
    } else {
      return true;
    }
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
  editDeviceSetting() {
    this.loadingDeviceSetting = true;

    var selectedBoitiersId: number[] = [];

    for (let numBoitier of this.numBoitiers) {
      selectedBoitiersId.push(numBoitier);
    }

    if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
      selectedBoitiersId.push(this.recalculeP.idBoitier);
    }

    this.deviceSetting.idBoitiers = selectedBoitiersId;
    if (!this.deviceSetting.streamId || this.deviceSetting.streamId == 0)
      this.deviceSetting.streamId = this.deviceSetting.idBoitiers[0];

    this.dataService.editDeviceSetting(this.ID_COMPTE, this.deviceSetting).subscribe(res => {
      this.showDevises(this.serverAccount.idCompteClientServer);
      this.loadingDeviceSetting = false;
      this.toastr.success('Paramètres boitier est mis à jour');
    }, error => {
      this.loadingDeviceSetting = false;
      this.toastr.error("Erreur de mise à jour", 'Erreur');
    })
  }

  getSearchDeviceIemi(imei: number) {
    let url = null;
    for (let boitier of this.boitiers) {
      if (boitier.idIpAdresse && boitier.idIpAdresse === this.deviceSetting.idIpAdresse) {
        url = boitier.urlGetId;
        break; // Exit the loop once url is found
      }
    }
    if (!url) {
      console.log("URL not found");
      return; // Exit the function if url is not found
    }

    console.log("res => " + url);

    // Assuming this.dataService.getDeviceIdImei returns an Observable
    this.dataService.getDeviceIdImei(url, imei).subscribe(res => {
      console.log("res => " + res.id);
      this.deviceSetting.streamId = res.id;
      console.log("res => " + res.id);
    });
  }



  resetOdometre() {
    this.loadingResetOdometre = true;
    var selectedBoitiersId: number[] = [];

    for (let numBoitier of this.numBoitiers) {
      selectedBoitiersId.push(numBoitier);
    }

    if (!this.isCheckedBoitier(this.recalculeP.idBoitier)) {
      selectedBoitiersId.push(this.recalculeP.idBoitier);
    }

    this.vehiculeSetting.idBoitiers = selectedBoitiersId;

    this.dataService.resetOdometre(this.ID_COMPTE, this.vehiculeSetting).subscribe(res => {
      this.showDevises(this.serverAccount.idCompteClientServer);
      this.loadingResetOdometre = false;
      this.toastr.success('Kilémotrage de boitier est mis à jour');
    }, error => {
      this.loadingResetOdometre = false;
      this.toastr.error("Erreur de mise à jour", 'Erreur');
    })
  }

}
