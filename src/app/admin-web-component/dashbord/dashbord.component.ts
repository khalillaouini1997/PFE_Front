import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { saveAs as importedSaveAs } from 'file-saver';
import { Boitier, CompteWeb, Tram } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';

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

  comptesWeb: CompteWeb[] = new Array();
  compteWeb: CompteWeb = new CompteWeb();
  boitiers: Boitier[] = new Array();
  listTram: Tram[] = new Array();

  loading: boolean = false;

  constructor(private service: DataService, private router: Router) { }

  ngOnInit() {

    if (localStorage.getItem("isReloading") == "true") {
      localStorage.removeItem("isReloading");
      window.location.reload();
    }

    this.service.isAuthenticated = this.service.loadTestAuthenticated();

    if (this.service.isAuthenticated == false) {

      this.router.navigate(['/error']);
    } else {
      this.service.getAllCompteClientWeb().subscribe(res => {
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
    this.service.getAllLastTram(this.compteWeb.idCompteClientWeb).subscribe(res => {
      this.listTram = res;
    })
  }

  /**
   * Action exporter rapport
   */
  onExport() {
    if (this.listTram.length <= 0) return;

    this.service.exportLastTram(this.listTram)
      .subscribe(blob => {
        importedSaveAs(blob, 'Repport d\'état des boitiers.xlsx');
      });
  }


}