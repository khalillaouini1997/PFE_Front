import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Boitier, CompteWeb, Tram } from 'src/app/data/data';
import { DashboardService } from 'src/app/service/dashboard.service';
import { DataService } from 'src/app/service/data.service';
import { saveAs as importedSaveAs } from 'file-saver';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  comptesWeb: CompteWeb[] = new Array();
  compteWeb: CompteWeb = new CompteWeb();
  boitiers: Boitier[] = new Array();
  listTram: Tram[] = new Array();

  loading: boolean = false;

  constructor(private dashboardService: DashboardService, private router: Router,
    private dataService: DataService) { }

  ngOnInit() {

    if (localStorage.getItem("isReloading") == "true") {
      localStorage.removeItem("isReloading");
      window.location.reload();
    }

    this.dashboardService.isAuthenticated = this.dashboardService.loadTestAuthenticated();

    if (this.dashboardService.isAuthenticated == false) {

      this.router.navigate(['/error']);
    } else {
      this.dataService.getAllCompteClientWeb().subscribe(res => {
        this.comptesWeb = res;
      });

    }
  }


  diffHours(date: Date): number {
    date = new Date(date);
    var diff = ((new Date().getTime()) - date.getTime()) / (60 * 60 * 1000);
    return diff;
  }

  getAllLastTramByCompteWeb() {
    if (!this.compteWeb.idCompteClientWeb) return;

    this.loading = true;
    this.listTram = [];
    this.dataService.getAllLastTram(this.compteWeb.idCompteClientWeb).subscribe(res => {
      this.listTram = res;
    })
  }

  /**
   * Action exporter rapport
   */
  onExport() {
    if (this.listTram.length <= 0) return;

    this.dataService.exportLastTram(this.listTram)
      .subscribe(blob => {
        importedSaveAs(blob, 'Repport d\'état des boitiers.xlsx');
      });
  }


}
