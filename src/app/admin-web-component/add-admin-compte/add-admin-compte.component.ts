import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorCompte } from 'src/app/data/data';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-add-admin-compte',
  templateUrl: './add-admin-compte.component.html',
  styleUrls: ['./add-admin-compte.component.css']
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
  constructor(private router: Router, private service: DataService) {
    //this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this.service.isAuthenticated = this.service.loadTestAuthenticated();
  }

  //==================================
  // add compte web with serve accout
  //==================================

  addAdminCompte() {
    this.service.addAdminCompte(this.adminCompte).subscribe(_adminCompte => {
      this.adminCompte = _adminCompte;

      //this.toastr.success('Admin Account is added successfully', 'Success!');
      this.adminCompte = new AdministratorCompte();
      this.date = "";
    }, error => { /*this.toastr.error('There is a mistake', 'Error!')*/ });

  }

}
