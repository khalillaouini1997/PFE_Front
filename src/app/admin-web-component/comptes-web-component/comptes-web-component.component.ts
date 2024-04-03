import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompteWeb } from 'src/app/data/data';
import { owner } from 'src/app/global.config';
import { DataService } from 'src/app/service/data.service';
import {CompteServerService} from "../../service/compte-server.service";
import {CompteWebService} from "../../service/compte-web.service";
import {DashboardService} from "../../service/dashboard.service";

/**
 *
 * created by AHMED HAYEL
 *
 */

@Component({
  selector: 'app-comptes-web-component',
  templateUrl: './comptes-web-component.component.html',
  styleUrls: ['./comptes-web-component.component.css']
})
export class ComptesWebComponentComponent implements OnInit {
  keyWord: string = "";
  public maxSize: number = 5;
  public bigTotalItems: number = 175;
  public bigCurrentPage: number = 1;
  public numPages: number = 0;
  itemsPerPage = 30;
  comptesWeb: CompteWeb[];
  selectedWebAccount: CompteWeb = new CompteWeb();
  dt: Object;
  code_pays = [];
  loading: boolean = false;
  owner: string;

  constructor(private router: Router, public toastr: ToastrService, vcr: ViewContainerRef,
              private compteServerService: CompteServerService,
              private compteWebService: CompteWebService,
              private dashboardService: DashboardService,
              private dataService: DataService,) {
    //this.toastr.setRootViewContainerRef(vcr);
    this.owner = owner;
  }

  ngOnInit() {
    this.dashboardService.isAuthenticated = this.dashboardService.loadTestAuthenticated();
    if (this.dashboardService.isAuthenticated == false) {
      this.router.navigate(['/error']);
    } else {
      this.getAllWebAccount(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
    }

    //this.getDateLogF("test");
  }

  //=====================================
  //    Change page
  //=====================================

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllWebAccount(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }
  //=====================================
  //     Get All Web account
  //     by keyword or not
  //=====================================

  getAllWebAccount(keyWord: string, page: number, size: number) {
 
    this.comptesWeb = [];
    this.compteWebService.getAllWebAccountByKeyWord(keyWord, page, size).subscribe(_comptesWeb => {
      this.loading = false;
      this.comptesWeb = _comptesWeb.content;

      for (let i = 0; i < this.comptesWeb.length; i++) {

        if (new Date().getTime() < new Date(this.comptesWeb[i].date_expiration).getTime()) {

          this.comptesWeb[i].expired = false;
          this.comptesWeb[i].during = true;
        } else {
          this.comptesWeb[i].expired = true;
          this.comptesWeb[i].during = false;
        }
      }
      this.bigTotalItems = _comptesWeb.totalElements;
    });
  }


  getDateLogF(username: string) {
    this.compteWebService.getDateLog(username).subscribe(res => {
    })
  }
  //=====================================
  //    Search server account
  //=====================================

  searchWebAccount() {
    this.bigCurrentPage = 1;
    this.getAllWebAccount(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  //=====================================
  //    Selected Web account
  //=====================================

  onSelect(compteWeb: CompteWeb) {
    this.selectedWebAccount = compteWeb;
    let dateDecop = new Date(this.selectedWebAccount.date_expiration);
    if (dateDecop.getUTCHours() == 23) {
      dateDecop.setHours(dateDecop.getHours() + 1);
    }
    this.dt = {
      date: { year: dateDecop.getFullYear(), month: dateDecop.getUTCMonth() + 1, day: dateDecop.getUTCDate() }
    };
    this.dt['jsdate'] = dateDecop;
  }

  //=====================================
  //    delete Web account
  //=====================================

  deleteWebAccount() {
    let res = confirm("are you sure that you want to delete this Account ?");
    if (res) {
      let indexCompte: number = 0;
      indexCompte = this.comptesWeb.findIndex(x => x.idCompteClientWeb == this.selectedWebAccount.idCompteClientWeb);
      this.compteWebService.deleteWebAccount(this.selectedWebAccount.idCompteClientWeb).subscribe(res => {
        this.toastr.success(' Account was deleted ', 'Success!')
      });
      this.comptesWeb.splice(indexCompte, 1);
    } else {
      this.toastr.error(' Account was not deleted ', 'Error!')
    }
  }


}
