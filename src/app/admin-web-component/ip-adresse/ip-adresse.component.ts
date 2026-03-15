import { Component, OnInit, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IpAddress } from 'src/app/data/data';
import { IpAddressService } from 'src/app/service/ip-address.service';
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-ip-adresse',
    standalone: true,
    templateUrl: './ip-adresse.component.html',
    styleUrls: ['./ip-adresse.component.css'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginationModule]
})
export class IpAdresseComponent implements OnInit {

  ipAddressSelected: IpAddress = new IpAddress();
  ips: IpAddress[] = [];
  public bigTotalItems: number = 0;
  public bigCurrentPage: number = 1;
  itemsPerPage = 15;
  typeConnection: { type: string; }[] = [];
  public maxSize: number = 5;

  searchForm!: FormGroup;
  updateIpForm!: FormGroup;

  private readonly ipAddressService = inject(IpAddressService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);

  ngOnInit() {
    this.initForms();
    this.getAllIpAddresse(this.searchForm.get('keyWord')?.value || "", this.bigCurrentPage - 1, this.itemsPerPage);
    this.typeConnection = this.ipAddressService.typeConnection;
  }

  initForms() {
    this.searchForm = this.fb.group({
      keyWord: ['']
    });

    this.updateIpForm = this.fb.group({
      idIpAdresse: [null],
      label: ['', Validators.required],
      value: ['', Validators.required],
      jdbcUser: [''],
      jdbcPass: [''],
      url: [''],
      typeConnection: [''],
      dbName: ['']
    });
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
    this.getAllIpAddresse(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
  }

  deleteIpAddress(id: number) {
    const res = confirm("are you sure that you want to delete this Ip ?");
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
            this.getAllIpAddresse(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
          },
          error: (error) => {
            this.toastr.error(error, 'Error!');
          }
        });
    }
  }

  onSelect(IpAddres: IpAddress) {
    this.ipAddressSelected = IpAddres;
    this.updateIpForm.patchValue(IpAddres);
  }

  updateIpAdress() {
    const updatedIp = this.updateIpForm.value;
    if (updatedIp.idIpAdresse !== null) {
      this.ipAddressService.updateIpAddress(updatedIp.idIpAdresse, updatedIp)
        .subscribe({
          next: () => {
            this.toastr.success('IP Address updated', 'Success');
            this.getAllIpAddresse(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
          }
        });
    }
  }

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllIpAddresse(this.searchForm.get('keyWord')?.value, this.bigCurrentPage - 1, this.itemsPerPage);
  }
}
