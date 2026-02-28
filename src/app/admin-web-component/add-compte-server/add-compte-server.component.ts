import { Component, OnInit, inject } from '@angular/core';
import { CompteServer, CompteServerWithBoitier, IpAddress } from 'src/app/data/data';
import { CompteServerService } from "../../service/compte-server.service";
import { AuthService } from "../../service/auth.service";
import { IpAddressService } from "../../service/ip-address.service";
import { BsLocaleService, BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { defineLocale } from 'ngx-bootstrap/chronos';
import { frLocale } from 'ngx-bootstrap/locale';
import { ToastrService } from 'ngx-toastr';
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { FormsModule } from '@angular/forms';

defineLocale('fr', frLocale);

@Component({
  selector: 'app-add-compte-server',
  templateUrl: './add-compte-server.component.html',
  styleUrls: ['./add-compte-server.component.css'],
  standalone: true,
  imports: [FormsModule, BsDatepickerModule]
})
export class AddCompteServerComponent implements OnInit {

  compteServer: CompteServer = new CompteServer();
  compteServerWithBoitier: CompteServerWithBoitier = new CompteServerWithBoitier();
  numberBoitier: number = 0;
  ipAddresses: IpAddress[] = [];
  public loading = false;
  mode: boolean = false;
  messageError: string = "";
  isExistPseudo: boolean = false;
  isExistLogin: boolean = false;
  confirmationPassword: string = "";
  public date: Date = new Date();

  private readonly compteServerService = inject(CompteServerService);
  private readonly ipAddressService = inject(IpAddressService);
  private readonly authService = inject(AuthService);
  private readonly localeService = inject(BsLocaleService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  constructor() {
    this.localeService.use('fr');
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
      return;
    }

    this.ipAddressService.getAllIps().subscribe(res => {
      this.ipAddresses = res;
    });
  }

  addCompteServer() {
    if (this.numberBoitier < 0) {
      this.toastr.error('number of Devices not valid', 'Error!');
      return;
    }

    this.loading = true;
    this.compteServer.date_Expiration = this.date.getTime();

    this.compteServerService.createServerComptewithBoitier(this.compteServer, this.numberBoitier)
      .pipe(
        catchError(error => {
          this.mode = true;
          this.messageError = error.error?.message || "An error occurred";
          this.loading = false;
          this.toastr.error('can not add account', 'Error!');
          throw error;
        })
      )
      .subscribe({
        next: (_compteServer) => {
          this.mode = false;
          this.loading = false;
          this.compteServerWithBoitier = _compteServer;
          this.toastr.success('Server Account added', 'Success!');
          this.router.navigate(['/adminWeb/listWebs']);
        }
      });
  }

  onKeyPseudo() {
    if (!this.compteServer.pseudo) return;
    this.compteServerService.isExistPseudo(this.compteServer.pseudo).subscribe(res => {
      this.isExistPseudo = res;
    });
  }

  onKeyLogin() {
    if (!this.compteServer.login) return;
    this.compteServerService.isExistLogin(this.compteServer.login).subscribe(res => {
      this.isExistLogin = res;
    });
  }

  reinitialisation() {
    this.numberBoitier = 0;
  }
}



