import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IpAddress } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-ip-adresse',
  templateUrl: './ip-adresse.component.html',
  styleUrls: ['./ip-adresse.component.css']
})
export class IpAdresseComponent implements OnInit {

  ipAddressSelected: IpAddress = new IpAddress();
  ips: IpAddress[] = [];
  public bigTotalItems: number = 175;
  public bigCurrentPage: number = 1;
  itemsPerPage = 15;
  keyWord: string = "";
  typeConnection: string | null = "";
  public maxSize: number = 5;


  constructor(public toastr: ToastrService, vcr: ViewContainerRef, private service: DataService, private router: Router) {
    //v12this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {

    //if (this.service.isAuthenticated == false) {
    // this.router.navigate(['/error']);
    //} else {
    this.getAllIpAddresse(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);

    this.typeConnection = this.service.typeConnection;
    // }

  }

  getAllIpAddresse(keyWord: string, page: number, size: number) {
    this.service.getAllIpAddresse(keyWord, page, size).subscribe(res => {
      this.ips = res.content;
      this.bigTotalItems = res.totalElements;
    })
  }
  searchIpAddress() {
    this.bigCurrentPage = 1;
    this.getAllIpAddresse(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }
  deleteIpAddress(id: number) {
    let res = confirm("are you sure that you want to delete this Ip ?");

    if (res) {

      this.service.deleteIpAdress(id).subscribe(res => {
        this.toastr.success(' Account was deleted ', 'Success!')
        this.getAllIpAddresse(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
      }, error => {
        this.toastr.error(' Account was not deleted ', 'Error!')
      })
    } else {
      this.toastr.error(' Account was not deleted ', 'Error!')
    }
  }

  onSelect(IpAddres: IpAddress) {

    this.ipAddressSelected = IpAddres
  }
  updateIpAdress() {
    this.service.updateIpAdress(this.ipAddressSelected.idIpAdresse, this.ipAddressSelected).subscribe(res => {
      this.getAllIpAddresse(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
    })

  }
  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;

    this.getAllIpAddresse(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);

  }
}