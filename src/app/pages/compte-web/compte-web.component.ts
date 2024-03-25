import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { CompteWeb } from 'src/app/data/data';
import { owner } from 'src/app/global.config';
import {CompteWebService} from "../../service/compte-web.service";
import {DashboardService} from "../../service/dashboard.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-compte-web',
  templateUrl: './compte-web.component.html',
  styleUrls: ['./compte-web.component.scss']
})
export class CompteWebComponent implements OnInit {

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

  constructor(private router: Router, public toastr: ToastrService, vcr: ViewContainerRef, private dashboardService: DashboardService , private  comptewebService: CompteWebService) {
    this.toastr.success('This is a success message!', 'Success'); // Type, Title (optional)
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
    this.loading = true;
    this.comptesWeb = [];
    this.comptewebService.getAllWebAccountByKeyWord(keyWord, page, size)
      .subscribe(_comptesWeb => {
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
        this.loading = false; // Set loading flag to false after successful response
      });
  }


  getDateLogF(username: string) {
    this.comptewebService.getDateLog(username).subscribe(res => {
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
      date: { year: dateDecop.getFullYear(), month: dateDecop.getUTCMonth() + 1, day: dateDecop.getUTCDate() },
      jsdate: dateDecop  // Add jsdate property to this.dt
    };
  }


  //=====================================
  //    delete Web account
  //=====================================

  deleteWebAccount() {
    let res = confirm("are you sure that you want to delete this Account ?");
    if (res) {
      let indexCompte: number = 0;
      indexCompte = this.comptesWeb.findIndex(x => x.idCompteClientWeb == this.selectedWebAccount.idCompteClientWeb);
      this.comptewebService.deleteWebAccount(this.selectedWebAccount.idCompteClientWeb).subscribe(res => {
        this.toastr.success(' Account was deleted ', 'Success!')
      });
      this.comptesWeb.splice(indexCompte, 1);
    } else {
      this.toastr.error(' Account was not deleted ', 'Error!')
    }
  }


}
