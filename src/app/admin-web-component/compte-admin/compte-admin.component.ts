import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorCompte } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';
import {finalize} from "rxjs";

@Component({
  selector: 'app-compte-admin',
  templateUrl: './compte-admin.component.html',
  styleUrls: ['./compte-admin.component.css']
})
export class CompteAdminComponent implements OnInit {
  keyWord: string = "";
  public maxSize: number = 5;
  public bigTotalItems: number = 175;
  public bigCurrentPage: number = 1;
  public numPages: number = 0;
  itemsPerPage = 30;
  adminComptes: AdministratorCompte[];
  loading: boolean;

  constructor(private router: Router, public service: DataService) { }

  ngOnInit() {
    this.service.isAuthenticated = this.service.loadTestAuthenticated();
    if (this.service.isAuthenticated == false) {
      this.router.navigate(['/error']);
    } else {
      this.getAllAdminComptes(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
    }
  }

  //=====================================
  //     Get All Web account
  //     by keyword or not
  //=====================================

  getAllAdminComptes(keyWord: string, page: number, size: number) {
    this.loading = true; // Set loading flag to true
    this.adminComptes = []; // Clear the existing adminComptes array

    // Call the service method to fetch adminComptes
    this.service.getAllAdminComptesByKeyWord(keyWord, page, size)
      .pipe(
        finalize(() => {
          this.loading = false; // Set loading flag to false when the request completes
        })
      )
      .subscribe(
        _comptesWeb => {
          this.adminComptes = _comptesWeb.content; // Update adminComptes with the received data
          this.bigTotalItems = _comptesWeb.totalElements; // Update bigTotalItems with the total count of elements
        },
        error => {
          console.error('Error occurred while fetching adminComptes:', error); // Handle any errors
        }
      );
  }


  //=====================================
  //    Search server account
  //=====================================

  searchWebAccount() {
    this.bigCurrentPage = 1;
    this.getAllAdminComptes(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

      //=====================================
  //    Change page
  //=====================================

  public pageChanged(event: any): void {
    this.bigCurrentPage = event.page;
    this.getAllAdminComptes(this.keyWord, this.bigCurrentPage - 1, this.itemsPerPage);
  }

}
