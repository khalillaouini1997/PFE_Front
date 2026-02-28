import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { saveAs as importedSaveAs } from 'file-saver';
import { Boitier, CompteWeb, Tram } from 'src/app/data/data';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from "src/app/service/web-account.service";
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashbord',
  templateUrl: './dashbord.component.html',
  styleUrls: ['./dashbord.component.css'],
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, DecimalPipe, DatePipe]
})
export class DashbordComponent implements OnInit {

  comptesWeb: CompteWeb[] = [];
  compteWeb: CompteWeb = new CompteWeb();
  boitiers: Boitier[] = [];
  listTram: Tram[] = [];
  loading: boolean = false;

  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly router = inject(Router);

  ngOnInit() {
    if (localStorage.getItem("isReloading") === "true") {
      localStorage.removeItem("isReloading");
      window.location.reload();
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    } else {
      this.webAccountService.getAllCompteClientWeb().subscribe(res => {
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
    this.webAccountService.getAllLastTram(this.compteWeb.idCompteClientWeb).subscribe(res => {
      this.listTram = res;
      this.loading = false;
    });
  }

  onExport() {
    if (this.listTram.length <= 0) return;

    this.webAccountService.exportLastTram(this.listTram)
      .subscribe(blob => {
        importedSaveAs(blob, 'Repport d\'état des boitiers.xlsx');
      });
  }
}
