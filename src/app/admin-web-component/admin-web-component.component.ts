import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { AdministratorCompte } from '../data/data';
import { AuthService } from '../service/auth.service';
import { WebAccountService } from '../service/web-account.service';
import { environment } from '../../environments/environment';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-admin-web-component',
  templateUrl: './admin-web-component.component.html',
  styleUrls: ['./admin-web-component.component.css'],
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive, RouterOutlet]
})
export class AdminWebComponentComponent implements OnInit {

  isActiveDashBoard: boolean = true;
  isActiveServerForm: boolean = false;
  isActiveForm: boolean = false;
  isActiveListServer: boolean = false;
  isActiveListWeb: boolean = false;
  isActiveRequest: boolean = false;
  isActiveIntervention: boolean = false;
  isActiveAccessLog: boolean = false;
  isActiveTraccar: boolean = false;
  isActiveAdminCompte: boolean = false;
  isActiveAddAdminCompte: boolean = false;
  owner: string = environment.owner;

  public currentUser: AdministratorCompte = new AdministratorCompte();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly webAccountService = inject(WebAccountService);

  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/authentification']);
      return;
    }

    this.webAccountService.getAllOptions().subscribe({
      next: (res) => {
        // Options are handled centrally if needed, or locally here
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/authentification']);
  }

  isAdminGolbal(): boolean {
    return this.authService.hasRole('GLOBALADMIN');
  }

  isWebAdmin(): boolean {
    return this.authService.hasRole('WEBADMIN');
  }

  isReporter(): boolean {
    return this.authService.hasRole('REPORTER');
  }

  isAgent(): boolean {
    return this.authService.hasRole('AGENT');
  }

  isGlobalAdmin(): boolean {
    return this.authService.hasRole('GLOBALADMIN') || this.authService.hasRole('WEBADMIN');
  }

  isGlobalAdminDesc(): boolean {
    return this.authService.hasRole('GLOBALADMINDESC');
  }
}
