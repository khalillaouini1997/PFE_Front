import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {saveAs as importedSaveAs} from 'file-saver';
import {Boitier, CompteWeb, Tram} from 'src/app/data/data';
import {DataService} from 'src/app/service/data.service';
import {CompteServerService} from "../../service/compte-server.service";
import {CompteWebService} from "../../service/compte-web.service";
import {DashboardService} from "../../service/dashboard.service";

/**
 *
 * created by AHMED HAYEL
 *
 */

@Component({
  selector: 'app-dashbord',
  templateUrl: './dashbord.component.html',
  styleUrls: ['./dashbord.component.css']
})
export class DashbordComponent implements OnInit {

  comptesWeb: CompteWeb[] = [];
  compteWeb: CompteWeb = new CompteWeb();
  boitiers: Boitier[] = [];
  listTram: Tram[] = [];

  loading: boolean = false;

  constructor(private compteServerService: CompteServerService,
              private compteWebService: CompteWebService,
              private dashboardService: DashboardService,
              private dataService: DataService,
              private router: Router) { }

  ngOnInit() {

    if (localStorage.getItem("isReloading") == "true") {
      localStorage.removeItem("isReloading");
      window.location.reload();
    }

    this.dashboardService.isAuthenticated = this.dashboardService.loadTestAuthenticated();

    if (!this.dashboardService.isAuthenticated) {

      this.router.navigate(['/error']);
    } else {
      this.compteWebService.getAllCompteClientWeb().subscribe(res => {
        this.comptesWeb = res;
      });

    }
  }


  diffHours(date: Date): number {
    date = new Date(date);
    return ((new Date().getTime()) - date.getTime()) / (60 * 60 * 1000);
  }

  getAllLastTramByCompteWeb() {
    if (!this.compteWeb.idCompteClientWeb) return;

    this.loading = true;
    this.listTram = [];
    this.compteWebService.getAllLastTram(this.compteWeb.idCompteClientWeb).subscribe(res => {
      this.listTram = res;
    })
  }

  /**
   * Action exporter rapport
   */
  onExport() {
    if (this.listTram.length <= 0) return;

    this.compteWebService.exportLastTram(this.listTram)
      .subscribe(blob => {
        importedSaveAs(blob, 'Repport d\'état des boitiers.xlsx');
      });
  }


}
