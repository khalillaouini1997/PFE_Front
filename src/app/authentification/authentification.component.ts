import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationService } from './authentification.service';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-authentification',
  templateUrl: './authentification.component.html',
  styleUrls: ['./authentification.component.scss']
})
export class AuthentificationComponent implements OnInit {


  //login et password
  login: string = '';
  password: string = '';
  // error message
  errorMessage: string;
  errorVisible: boolean = false;
  loading: boolean = false;


  constructor(private authentificationService: AuthentificationService, private router: Router,
    private dataService: DataService, private toastr: ToastrService) { }

  ngOnInit() {

  }

  //=====================================
  //           authentification
  //=====================================

  /*onSubmit() {
    this.authentificationService.authentificate(this.login, this.password).subscribe(_admin => {
      this.authentificationService.saveTokenInStorage(_admin.token, true);
      localStorage.setItem("user", JSON.stringify(_admin));
      this.errorVisible = false;
      localStorage.setItem("isReloading", "true");
      if (_admin.user.role == 'AGENT') {
        this.router.navigate(['/adminWeb/compteweb']);
      } else {
        this.router.navigate(['/adminWeb/dashboard']);
      }
    }, error => { this.errorVisible = true; this.errorMessage = "this login or password is not correct or you are not allowed "; });
  }*/


  onSubmit() {
    this.loading = true;

    if (localStorage.getItem('id_token')) {
      localStorage.removeItem('id_token');
    }

    this.authentificationService.currentUser = null;

    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('id_token');

    this.authentificationService.authentificate(this.login, this.password).subscribe(_admin => {
      this.authentificationService.saveTokenInStorage(_admin.token, true);
      localStorage.setItem('currentUser', JSON.stringify(_admin));
      this.dataService.currentUser = _admin;
      this.authentificationService.currentUser = _admin;
      localStorage.setItem("isReloading", "true");
      if (_admin.user.role == 'AGENT') {
        this.router.navigate(['/adminWeb/compteweb']);
      } else {
        this.router.navigate(['/adminWeb/dashboard']);
      }
    }), (error: any) => {
      {
        this.toastr.error('Username Or Password are incorrect', 'Login Error',);
      }
    }
  }
}
