import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorCompte } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';
import {catchError} from "rxjs/operators";
import {of, tap} from "rxjs";
import {ToastrService} from "ngx-toastr";
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-add-admin-compte',
    templateUrl: './add-admin-compte.component.html',
    styleUrls: ['./add-admin-compte.component.css'],
    standalone: true,
    imports: [NgIf, FormsModule, NgFor]
})
export class AddAdminCompteComponent implements OnInit {

  adminCompte: AdministratorCompte = new AdministratorCompte();
  date: Object;

  mode: boolean = false;
  //select periode
  role = 'WEBADMIN';
  roles = ['GLOBALADMIN', 'WEBADMIN', 'GLOBALADMINDESC', 'AGENT'];

  //select periode
  notifSub = 'date_sub(NOW(), INTERVAL 1 DAY)';
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  checked: boolean;
  messageError: string;
  constructor(private router: Router, private service: DataService, private toastr: ToastrService, ) {

  }

  ngOnInit() {
    this.service.isAuthenticated = this.service.loadTestAuthenticated();
  }

  //==================================
  // add compte web with serve accout
  //==================================

  addAdminCompte() {
    this.service.addAdminCompte(this.adminCompte)
      .pipe(
        tap(adminCompte => { // Handle successful response
          this.adminCompte = adminCompte;
          this.toastr.success('Admin Account is added successfully', 'Success!');
        }),
        catchError(error => { // Handle errors
          console.error('Error adding admin compte:', error);
          this.toastr.error('There is a mistake', 'Error!');
          return of(null); // Handle error appropriately, emit null or another value
        })
      )
      .subscribe(); // Subscribe without arguments to trigger execution
  }

}
