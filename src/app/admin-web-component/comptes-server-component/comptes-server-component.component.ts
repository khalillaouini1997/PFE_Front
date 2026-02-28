import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { saveAs as importedSaveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { CompteServer, IpAddress } from 'src/app/data/data';
import { CompteServerService } from "../../service/compte-server.service";
import { IpAddressService } from "../../service/ip-address.service";
import { AuthService } from "../../service/auth.service";
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-comptes-server-component',
  templateUrl: './comptes-server-component.component.html',
  styleUrls: ['./comptes-server-component.component.css'],
  standalone: true,
  imports: [FormsModule, RouterLink, PaginationModule, BsDatepickerModule]
})
export class ComptesServerComponentComponent implements OnInit {

  keyWord: string = "";
  public maxSize: number = 5;
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  itemsPerPage = 30;
  comptesServer: CompteServer[] = [];
  loading: boolean = false;
  dt: Date = new Date();
  selectedCompteServer: CompteServer = new CompteServer();
  mode: boolean = false;
  messageError: string = "";
  ips: IpAddress[] = [];

  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly compteServerService = inject(CompteServerService);
  private readonly ipAddressService = inject(IpAddressService);
  private readonly authService = inject(AuthService);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
      return;
    }

    this.getAllcompteServer(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
    this.ipAddressService.getAllIps().subscribe(res => {
      this.ips = res;
    });
  }

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllcompteServer(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  getAllcompteServer(keyWord: string, page: number, size: number) {
    this.loading = true;
    this.comptesServer = [];
    this.compteServerService.getAllServerAccount(keyWord, page, size).subscribe({
      next: (_comptesServer) => {
        this.comptesServer = _comptesServer.content;
        const now = new Date().getTime();
        this.comptesServer.forEach(s => {
          s.expired = now >= s.date_Expiration;
          s.during = !s.expired;
        });
        this.bigTotalItems = _comptesServer.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  searchAccount() {
    this.bigCurrentPage = 1;
    this.getAllcompteServer(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  onExport() {
    if (this.comptesServer.length <= 0) return;

    this.compteServerService.ExportListComptesServer(this.comptesServer)
      .subscribe(blob => {
        importedSaveAs(blob, 'Rapport des comptes serveur.xlsx');
      });
  }

  deleteCompteServer() {
    if (confirm("are you sure that you want to delete this Account ?")) {
      this.compteServerService.deleteCompteServer(this.selectedCompteServer.idCompteClientServer).subscribe({
        next: () => {
          this.comptesServer = this.comptesServer.filter(x => x.idCompteClientServer !== this.selectedCompteServer.idCompteClientServer);
          this.toastr.success(' Account was deleted ', 'Success!');
        },
        error: () => {
          this.toastr.error(' Account was not deleted ', 'Error!');
        }
      });
    }
  }

  updateCompteServer() {
    this.selectedCompteServer.date_Expiration = this.dt.getTime();
    this.compteServerService.updateServerCompte(this.selectedCompteServer.idCompteClientServer, this.selectedCompteServer).subscribe({
      next: (_compteUp) => {
        this.mode = false;
        const now = new Date().getTime();
        _compteUp.expired = now >= _compteUp.date_Expiration;
        _compteUp.during = !_compteUp.expired;

        const index = this.comptesServer.findIndex(x => x.idCompteClientServer === _compteUp.idCompteClientServer);
        if (index !== -1) {
          this.comptesServer[index] = _compteUp;
        }
        this.toastr.success(' Server account updated ', 'Success!');
      },
      error: (error) => {
        this.mode = true;
        this.messageError = error.error?.message || "An error occurred";
      }
    });
    this.selectedCompteServer = new CompteServer();
  }

  onSelect(compteServer: CompteServer) {
    this.selectedCompteServer = { ...compteServer };
    this.dt = new Date(this.selectedCompteServer.date_Expiration);
  }
}
