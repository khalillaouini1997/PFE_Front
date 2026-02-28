import { Component, OnInit, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IpAddress } from 'src/app/data/data';
import { IpAddressService } from 'src/app/service/ip-address.service';
import { catchError } from "rxjs/operators";
import { of } from "rxjs";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-ip-adresse',
  templateUrl: './ip-adresse.component.html',
  styleUrls: ['./ip-adresse.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationModule]
})
export class IpAdresseComponent implements OnInit {

  ipAddressSelected: IpAddress = new IpAddress();
  ips: IpAddress[] = [];
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  itemsPerPage = 15;
  keyWord: string = "";
  typeConnection: { type: string; }[] = [];
  public maxSize: number = 5;

  private readonly ipAddressService = inject(IpAddressService);
  private readonly toastr = inject(ToastrService);

  ngOnInit() {
    this.getAllIpAddresse(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
    this.typeConnection = this.ipAddressService.typeConnection;
  }

  getAllIpAddresse(keyWord: string, page: number, size: number) {
    this.ipAddressService.getAllIpAddresses(keyWord, page, size).subscribe({
      next: (res) => {
        this.ips = res.content;
        this.bigTotalItems = res.totalElements;
      }
    });
  }

  searchIpAddress() {
    this.bigCurrentPage = 1;
    this.getAllIpAddresse(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  deleteIpAddress(id: number) {
    let res = confirm("are you sure that you want to delete this Ip ?");
    if (res) {
      this.ipAddressService.deleteIpAddress(id)
        .pipe(
          catchError(error => {
            console.error('Error occurred while deleting IP address:', error);
            return of('Failed to delete IP address: ' + error.message);
          })
        )
        .subscribe({
          next: () => {
            this.toastr.success(' Account was deleted ', 'Success!');
            this.getAllIpAddresse(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
          },
          error: (error) => {
            this.toastr.error(error, 'Error!');
          }
        });
    }
  }

  onSelect(IpAddres: IpAddress) {
    this.ipAddressSelected = IpAddres;
  }

  updateIpAdress() {
    if (this.ipAddressSelected.idIpAdresse !== null) {
      this.ipAddressService.updateIpAddress(this.ipAddressSelected.idIpAdresse, this.ipAddressSelected)
        .subscribe({
          next: () => {
            this.toastr.success('IP Address updated', 'Success');
            this.getAllIpAddresse(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
          }
        });
    }
  }

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllIpAddresse(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }
}
