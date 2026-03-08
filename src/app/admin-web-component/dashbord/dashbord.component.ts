import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterModule, RouterLink, RouterLinkActive } from "@angular/router";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CompteClientWebInfoDTO, RealTime, Tram } from 'src/app/data/data';
import { AuthService } from 'src/app/service/auth.service';
import { WebAccountService } from "src/app/service/web-account.service";
import { saveAs as importedSaveAs } from 'file-saver';

@Component({
    selector: 'app-dashbord',
    templateUrl: './dashbord.component.html',
    styleUrls: ['./dashbord.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DecimalPipe, DatePipe]
})
export class DashbordComponent implements OnInit {

  comptesWeb: CompteClientWebInfoDTO[] = [];
  compteWeb: CompteClientWebInfoDTO = {} as CompteClientWebInfoDTO;
  realtimes: Tram[] = [];
  keyword: string = "";
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  loading: boolean = false;

  dashboardForm!: FormGroup;

  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  ngOnInit() {
    this.initForms();
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

  initForms() {
    this.dashboardForm = this.fb.group({
      compteWeb: [null]
    });
  }

  diffHours(date: Date): number {
    date = new Date(date);
    return ((new Date().getTime()) - date.getTime()) / (60 * 60 * 1000);
  }

  getAllLastTramByCompteWeb() {
    const selectedCompte = this.dashboardForm.get('compteWeb')?.value;
    if (!selectedCompte || !selectedCompte.idCompteClientWeb) return;

    this.loading = true;
    this.realtimes = [];
    this.webAccountService.getAllLastTram(selectedCompte.idCompteClientWeb).subscribe(res => {
      this.realtimes = res as any;
      this.loading = false;
    });
  }

  onExport() {
    if (this.realtimes.length <= 0) return;

    this.webAccountService.exportLastTram(this.realtimes as any)
      .subscribe(blob => {
        importedSaveAs(blob, 'Repport d\'état des boitiers.xlsx');
      });
  }
}
