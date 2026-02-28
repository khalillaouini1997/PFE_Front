import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterModule, RouterLink, RouterLinkActive } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { CompteClientWebInfoDTO, RealTime } from 'src/app/data/data';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from "src/app/service/web-account.service";
import { saveAs as importedSaveAs } from 'file-saver';

@Component({
  selector: 'app-dashbord',
  templateUrl: './dashbord.component.html',
  styleUrls: ['./dashbord.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DecimalPipe, DatePipe]
})
export class DashbordComponent implements OnInit {

  comptesWeb: CompteClientWebInfoDTO[] = [];
  compteWeb: CompteClientWebInfoDTO = {} as CompteClientWebInfoDTO;
  realtimes: RealTime[] = [];
  keyword: string = "";
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
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
    if (!this.compteWeb || !this.compteWeb.idCompteClientWeb) return;

    this.loading = true;
    this.realtimes = [];
    this.webAccountService.getAllLastTram(this.compteWeb.idCompteClientWeb).subscribe(res => {
      this.realtimes = res;
      this.loading = false;
    });
  }

  onExport() {
    if (this.realtimes.length <= 0) return;

    this.webAccountService.exportLastTram(this.realtimes)
      .subscribe(blob => {
        importedSaveAs(blob, 'Repport d\'état des boitiers.xlsx');
      });
  }
}
