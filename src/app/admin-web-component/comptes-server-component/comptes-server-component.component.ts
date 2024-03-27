import { Router } from '@angular/router';
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { saveAs as importedSaveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { CompteServer, IpAddress } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';

/**
 * 
 * created by AHMED HAYEL
 * 
 */

@Component({
  selector: 'app-comptes-server-component',
  templateUrl: './comptes-server-component.component.html',
  styleUrls: ['./comptes-server-component.component.css']
})
export class ComptesServerComponentComponent implements OnInit {

  keyWord: string = "";
  public maxSize: number = 5;
  public bigTotalItems: number = 175;
  public bigCurrentPage: number = 1;
  public numPages: number = 0;
  itemsPerPage = 30;
  comptesServer: CompteServer[];
  loading: boolean = false;
  dt: Object;
  selectedCompteServer: CompteServer = new CompteServer();
  mode: boolean = false;
  messageError: string;
  ips: IpAddress[] = [];

  /*public myDatePickerOptions: IMyOptions = {
    dateFormat: 'dd-mm-yyyy',
  };*/

  constructor(private router: Router, public toastr: ToastrService, vcr: ViewContainerRef,private service: DataService) {
  //  this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.service.isAuthenticated = this.service.loadTestAuthenticated();
    if (this.service.isAuthenticated == false) {

      this.router.navigate(['/error']);

    } else {
      this.getAllcompteServer(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
      this.ips = this.service.ips;
    }
  }

  //=====================================
  //    Change page 
  //=====================================

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllcompteServer(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }
  //=====================================
  //     Get All server account 
  //     by keyword or not  
  //=====================================

  getAllcompteServer(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.comptesServer = [];
    this.service.getAllServerAccount(keyWord, page, size).subscribe(_comptesServer => {
        this.comptesServer = _comptesServer.content;
        for (let i = 0; i < this.comptesServer.length; i++) {

          if (new Date().getTime() < this.comptesServer[i].date_Expiration) {

            this.comptesServer[i].expired = false;
            this.comptesServer[i].during = true;
          } else {
            this.comptesServer[i].expired = true;
            this.comptesServer[i].during = false;
          }
        }
        this.bigTotalItems = _comptesServer.totalElements;
      });
  }
  //=====================================
  //    Search server account 
  //=====================================

  searchServerAccount() {
    this.bigCurrentPage = 1;
    this.getAllcompteServer(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  /**
   * Action exporter rapport
   */
  onExport() {
    if (this.comptesServer.length <= 0) return;

    this.service.ExportListComptesServer(this.comptesServer)
      .subscribe(blob => {
        importedSaveAs(blob, 'Rapport des comptes serveur.xlsx');
      });
  }

  //=====================================
  //    Search server account 
  //=====================================

  searchAccount() {
    this.bigCurrentPage = 1;
    this.getAllcompteServer(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  //=======================================
  //    Delete server account with boitiers
  //=======================================

  deleteCompteServer() {
    let res = confirm("are you sure that you want to delete this Account ?");
    if (res) {
      let indexCompte: number = 0;
      indexCompte = this.comptesServer.findIndex(x => x.idCompteClientServer == this.selectedCompteServer.idCompteClientServer);

      this.service.deleteCompteServer(this.selectedCompteServer.idCompteClientServer);
      this.comptesServer.splice(indexCompte, 1);
      this.toastr.success(' Account was deleted ', 'Success!')
    } else {
      this.toastr.error(' Account was not deleted ', 'Error!')
    }

  }

  //=======================================
  //   Update server account
  //=======================================

  updateCompteServer() {
    let myDate = new Date(this.dt['jsdate']);
    if (myDate.getUTCHours() == 23) {
      myDate.setHours(myDate.getHours() + 1);
    }
    this.selectedCompteServer.date_Expiration = myDate.getTime();
    this.service.updateServerCompte(this.selectedCompteServer.idCompteClientServer, this.selectedCompteServer).subscribe(_compteUp => {
      this.mode = false;
      if (new Date().getTime() < _compteUp.date_Expiration) {
        _compteUp.expired = false;
        _compteUp.during = true;
      } else {
        _compteUp.expired = true;
        _compteUp.during = false;
      }
      let index: number = 0
      index = this.comptesServer.findIndex(x => x.idCompteClientServer == _compteUp.idCompteClientServer);
      this.comptesServer.splice(index, 1, _compteUp);
      this.toastr.success(' Server account updated ', 'Success!')
    }, error => {
      this.mode = true;

      const jsonError = error.json();
      this.messageError = jsonError.message;
    });
    this.selectedCompteServer = new CompteServer();
  }
  addZero(i) {
    return (i < 10) ? "0" + i : "" + i;
  }

  //=====================================
  //     selected server account 
  //=====================================

  onSelect(compteServer: CompteServer) {
    this.selectedCompteServer = compteServer;
    let dateDecop = new Date(this.selectedCompteServer.date_Expiration);

    this.dt = {
      date: { year: dateDecop.getFullYear(), month: dateDecop.getUTCMonth() + 1, day: dateDecop.getUTCDate() }
    };
    this.dt['jsdate'] = dateDecop;
  }
}
