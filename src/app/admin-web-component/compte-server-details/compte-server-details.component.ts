import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Boitier, CompteServer } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';
import {CompteWebService} from "../../service/compte-web.service";
import {DashboardService} from "../../service/dashboard.service";
import {CompteServerService} from "../../service/compte-server.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-compte-server-details',
  templateUrl: './compte-server-details.component.html',
  styleUrls: ['./compte-server-details.component.css']
})
export class CompteServerDetailsComponent implements OnInit {
  val: any = 0;
  compteServer: CompteServer = new CompteServer();
  boitiers: Boitier[] = [];
  boitiersInvalid: Boitier[] = [];
  BOITIER_INSTALLED: number = 0;
  BOITIER_NOT_INSTALLED: number = 0;
  selectedBoitier: Boitier = new Boitier();
  ID_COMPTE: number = 0;
  nbrBoitiers: number = 0;
  searchBoitier: string = "";
  intervalFrom: number = 0;
  intervalTo: number = 0;
  mode: boolean = false;
  messageError: string;
  //for pagination
  public maxSize: number = 5;
  public bigTotalItems: number = 175;
  public bigCurrentPage: number = 1;
  public pagesFrom: number = 0;
  itemsPerPage = 15;
  constructor( vcr: ViewContainerRef,
               public toastr: ToastrService,
               private route: ActivatedRoute, private compteServerService: CompteServerService, private compteWebService: CompteWebService, private dashboardService: DashboardService, private dataService: DataService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.dashboardService.isAuthenticated = this.dashboardService.loadTestAuthenticated();
    this.route.params.subscribe((params: Params) => {

      this.ID_COMPTE = (+params['idCompteClientServer']);

      this.compteServerService.getCompteServerById(this.ID_COMPTE).subscribe(_compteServer => {
        this.compteServer = _compteServer;
        this.intervalFrom = _compteServer.intervaleStart;

        this.intervalTo = _compteServer.intervaleEnd;

        this.BOITIER_NOT_INSTALLED = this.compteServer.intervaleEnd - this.compteServer.intervaleStart + 1;
      }
      );
      this.getBoitiersOfAccount(this.searchBoitier, this.ID_COMPTE, this.bigCurrentPage - 1, this.itemsPerPage);

    });
    this.val = setInterval(() => {
      this.getlastArchive(this.boitiers);

    }, 20000);

  }
  ngOnDestroy() {

    this.val = clearInterval(this.val);


  }
  //=====================================
  //     Get All account
  //=====================================

  getBoitiersOfAccount(keyWord: string, idCompteServer: number, page: number, size: number) {

    this.compteServerService.getBoitierOfAccount(keyWord, idCompteServer, page, size).subscribe(_boitiers => {
      this.boitiers = _boitiers.content;
      for (let i = 0; i < this.boitiers.length; i++) {
        this.boitiers[i].stat = this.boitiers[i].etatBoitier == "INSTALLED";

      }
      //this.intervalFrom = this.intervalFrom + _boitiers.totalElements;
      this.BOITIER_INSTALLED = _boitiers.totalElements;
      this.bigTotalItems = _boitiers.totalElements;
      this.getlastArchive(this.boitiers);
      this.getlastArchiveinvalid(this.boitiers);
    });
  }

  //=====================================
  //     Search device by keyword
  //=====================================

  getBoitiersOfAccountByKeyWord(keyWord: string, idCompteServer: number, page: number, size: number) {


    this.compteServerService.getBoitierOfAccount(keyWord, idCompteServer, page, size).subscribe(_boitiers => {
      this.boitiers = _boitiers.content;
      for (let i = 0; i < this.boitiers.length; i++) {
        this.boitiers[i].stat = true;
      }
      this.bigTotalItems = _boitiers.totalElements;
      this.getlastArchive(this.boitiers);
    });
  }

  //=====================================
  //     Search device by keyword (click)
  //=====================================

  searchBoitiers() {
    this.bigCurrentPage = 1;
    if (this.searchBoitier == "") {
      this.getBoitiersOfAccount(this.searchBoitier, this.ID_COMPTE, this.bigCurrentPage - 1, this.itemsPerPage);
    } else {
      this.getBoitiersOfAccountByKeyWord(this.searchBoitier, this.ID_COMPTE, this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }

  //=====================================
  //     change page
  //=====================================

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    if (this.searchBoitier == "") {
      this.getBoitiersOfAccount(this.searchBoitier, this.ID_COMPTE, this.bigCurrentPage - 1, this.itemsPerPage);
    } else {
      this.getBoitiersOfAccountByKeyWord(this.searchBoitier, this.ID_COMPTE, this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }

  //=====================================
  //     selected boitier
  //=====================================

  onSelect(boitier: Boitier) {
    this.selectedBoitier = boitier;
  }

  //=====================================
  //     Update boitier
  //=====================================

  updateBoitier() {
    let headers = new Headers({ 'Content-Type': 'application/json' });

    this.compteServerService.updateBoitier(this.selectedBoitier, this.ID_COMPTE, "label").subscribe(_boitier => {
      let indexboitier: number = 0;
      indexboitier = this.boitiers.findIndex(x => x.idBoitier == this.selectedBoitier.idBoitier);

      this.boitiers[indexboitier].label = _boitier.label;
      this.boitiers[indexboitier].stat = this.boitiers[indexboitier].etatBoitier == "INSTALLED";
      this.toastr.success(' Device updated ', 'Success!')
    }, error => { this.toastr.error('There is a mistake', 'Error!') });
  }

  //=====================================
  //     Add Boitiers to Server Account
  //=====================================

  addBoitiers() {

    if (this.BOITIER_NOT_INSTALLED >= this.nbrBoitiers) {
      this.addBoitierAfterConfirmation();
    }
    else {
      let res = confirm("Vous êtes sur de vouloir ajouter une nouvelle intervalle libre  ?");
      if (res) {
        this.addBoitierAfterConfirmation();
      }
    }
  }

  addBoitierAfterConfirmation() {
    // this.spinnerService.show();
    this.compteServerService.addBoitiers(this.ID_COMPTE, this.nbrBoitiers)
      .subscribe({
        next: _compteBoitiers => {
          // this.spinnerService.hide();
          this.mode = false;
          this.BOITIER_NOT_INSTALLED = _compteBoitiers.compteserver.intervaleEnd - _compteBoitiers.compteserver.intervaleStart + 1;
          this.BOITIER_INSTALLED = _compteBoitiers.boitiers;
          this.intervalFrom = _compteBoitiers.compteserver.intervaleStart;
          this.intervalTo = _compteBoitiers.compteserver.intervaleEnd;
          this.bigTotalItems = _compteBoitiers.boitiers;
          this.bigCurrentPage = 1;

          this.getBoitiersOfAccount(this.searchBoitier, this.ID_COMPTE, this.bigCurrentPage - 1, this.itemsPerPage);
          this.toastr.success(this.nbrBoitiers + ' devices are added to account ', 'Success!');
          this.nbrBoitiers = 0;
        },
        error: error => {
          this.mode = true;
          const jsonError = error.json();
          this.messageError = jsonError.message;
           //this.spinnerService.hide();
          this.toastr.error('There is a mistake', 'Error!')
        }
      });
  }



  //=====================================
  //     extends interval of Boitiers
  //=====================================

  extendIntervalOfBoitiers() {
    if (this.BOITIER_NOT_INSTALLED == 0) {
      let res = confirm("are you sure that you want extend this Account ?");
      if (res) {

        this.compteServerService.extendIntervalOfBoitiers(this.ID_COMPTE).subscribe(_compteServer => {

          this.BOITIER_NOT_INSTALLED = _compteServer.intervaleEnd - _compteServer.intervaleStart + 1;
          this.BOITIER_INSTALLED = _compteServer.boitiers.length;
          this.toastr.success('interval extended', 'Success!')
        });
      }

    } else {
      this.toastr.error('you can extend this interval because there is more devices available', 'Error!')
    }
  }

  //=====================================
  //     get last archive of device
  //=====================================

  getlastArchive(boitiers: Boitier[]) {
    for (let i = 0; i < this.boitiers.length; i++) {


      this.dataService.lastArchiveOfBoitier(this.boitiers[i].numBoitier).subscribe(_arch => {
        this.boitiers[i].dateLastTrame = _arch.dateLastTrame;

        if (_arch.latitude != 0 && _arch.longitude != 0) {
          this.boitiers[i].emplacement = (_arch.latitude.toFixed(3)) + " : " + (_arch.longitude.toFixed(3));
        }

        this.boitiers[i].vitesse = _arch.vitesse;
        this.boitiers[i].gpsLastTrame = _arch.gpsLastTrame;
        this.boitiers[i].gsmLastTrame = _arch.gsmLastTrame;
      });
    }
  }
  getlastArchiveinvalid(boitiers: Boitier[]) {

    for (let i = 0; i < boitiers.length; i++) {

      this.compteServerService.lastArchiveOfBoitier(boitiers[i].numBoitier).subscribe(_arch => {

        if (_arch.numBoitier != null) {
          if (_arch.latitude == 0 || _arch.longitude == 0 || _arch.latitude == 0 || _arch.longitude == 0) {
            let boitier: Boitier = new Boitier();
            boitier.emplacement = (_arch.latitude.toFixed(3)) + " : " + (_arch.longitude.toFixed(3));


            boitier.vitesse = _arch.vitesse;
            boitier.gpsLastTrame = _arch.gpsLastTrame;
            boitier.gsmLastTrame = _arch.gsmLastTrame;

            this.boitiersInvalid.push(_arch);


          }
        }

      });
    }
  }
  //=====================================
  //     Change Device Status
  //=====================================


  changeBoitierStatus(boitier: Boitier) {
    boitier.etatBoitier = "INSTALLED";

    let headers = new Headers({ 'Content-Type': 'application/json' });

    this.dataService.updateBoitier(boitier, this.ID_COMPTE, "etat").subscribe(_boitier => {
      let indexboitier: number = 0;
      indexboitier = this.boitiers.findIndex(x => x.idBoitier == boitier.idBoitier);

      if (this.boitiers[indexboitier].etatBoitier == "INSTALLED") {
        this.boitiers[indexboitier].stat = true;
      }
      this.toastr.success(' Device is Installed now  ', 'Success!')
    }, error => { this.toastr.error('Table of this server is not Exists ', 'Error!') });
  }
}
