import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorCompte } from 'src/app/data/data';
import { AdminAccountService } from 'src/app/service/admin-account.service';
import { AuthService } from 'src/app/service/auth.service';
import { catchError } from "rxjs/operators";
import { of, tap } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-admin-compte',
  templateUrl: './add-admin-compte.component.html',
  styleUrls: ['./add-admin-compte.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class AddAdminCompteComponent implements OnInit {

  adminCompte: AdministratorCompte = new AdministratorCompte();
  mode: boolean = false;
  role = 'WEBADMIN';
  roles = ['GLOBALADMIN', 'WEBADMIN', 'GLOBALADMINDESC', 'AGENT'];
  notifSub = 'date_sub(NOW(), INTERVAL 1 DAY)';
  notifSubs = ['date_sub(NOW(), INTERVAL 6 hour)', 'date_sub(NOW(), INTERVAL 1 DAY)', 'date_sub(NOW(), INTERVAL 2 DAY)'];
  checked: boolean = false;
  messageError: string = "";

  private readonly router = inject(Router);
  private readonly adminAccountService = inject(AdminAccountService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/error']);
    }
  }

  addAdminCompte() {
    this.adminAccountService.addAdminCompte(this.adminCompte)
      .pipe(
        tap(adminCompte => {
          this.adminCompte = adminCompte;
          this.toastr.success('Admin Account is added successfully', 'Success!');
        }),
        catchError(error => {
          console.error('Error adding admin compte:', error);
          this.toastr.error('There is a mistake', 'Error!');
          return of(null);
        })
      )
      .subscribe();
  }
}
