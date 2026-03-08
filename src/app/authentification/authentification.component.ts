import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-authentification',
    templateUrl: './authentification.component.html',
    styleUrls: ['./authentification.component.scss'],
    imports: [FormsModule]
})
export class AuthentificationComponent {

  login: string = '';
  password: string = '';
  errorMessage: string = '';
  errorVisible: boolean = false;
  loading: boolean = false;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  onSubmit() {
    this.loading = true;
    this.authService.logout();

    this.authService.authentificate(this.login, this.password).subscribe({
      next: (_admin) => {
        this.loading = false;
        this.authService.saveSession(_admin);
        localStorage.setItem("isReloading", "true");
        if (_admin.user.role === 'AGENT') {
          this.router.navigate(['/adminWeb/compteweb']);
        } else {
          this.router.navigate(['/adminWeb/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorVisible = true;
        this.errorMessage = "Login or password is incorrect";
        this.toastr.error('Username Or Password are incorrect', 'Login Error');
      }
    });
  }
}
