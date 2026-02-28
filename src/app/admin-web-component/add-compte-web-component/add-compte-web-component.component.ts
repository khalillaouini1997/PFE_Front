import { Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { CompteServer, CompteWeb, IpAddress } from 'src/app/data/data';
import { WebAccountService } from "../../service/web-account.service";
import { AuthService } from "../../service/auth.service";
import { CompteServerService } from "../../service/compte-server.service";
import { IpAddressService } from "../../service/ip-address.service";
import { ToastrService } from "ngx-toastr";
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-add-compte-web-component',
  templateUrl: './add-compte-web-component.component.html',
  styleUrls: ['./add-compte-web-component.component.css'],
  standalone: true,
  imports: [FormsModule, BsDatepickerModule]
})
export class AddCompteWebComponentComponent implements OnInit {

  compteWeb: CompteWeb = new CompteWeb();
  serverAccounts: CompteServer[] = [];
  numberBoitier: number = 0;
  idCompte: number = 0;
  date: Date = new Date();
  codesPays: any[] = [];
  ipAddresses: IpAddress[] = [];
  regions = ['Tunis', 'Sfax', 'Sousse'];
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  checked: boolean = false;

  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly webAccountService = inject(WebAccountService);
  private readonly authService = inject(AuthService);
  private readonly ipAddressService = inject(IpAddressService);
  private readonly compteServerService = inject(CompteServerService);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
      return;
    }

    this.compteServerService.getAllServerAccountForForm().subscribe(res => {
      this.serverAccounts = res.content;
    });

    this.codesPays = this.webAccountService.codesPays;
    this.ipAddressService.getAllIps().subscribe(res => {
      this.ipAddresses = res;
    });
  }

  addCompteWeb() {
    this.compteWeb.date_expiration = this.date.getTime();
    const selectedServer = this.serverAccounts.find(s => s.idCompteClientServer == this.idCompte);
    if (selectedServer) {
      this.compteWeb.compteClientServer = selectedServer;
    }

    this.webAccountService.addCompteWeb(this.compteWeb).subscribe({
      next: (_compteWeb) => {
        this.compteWeb = _compteWeb;
        this.webAccountService.associateCompteWebToCompteServer(this.compteWeb.idCompteClientWeb, this.idCompte).subscribe();
        this.toastr.success('Web Account is added successfully', 'Success!');
        this.compteWeb = new CompteWeb();
        this.router.navigate(['/adminWeb/listWebs']);
      },
      error: () => {
        this.toastr.error('There is a mistake', 'Error!');
      }
    });
  }
}
