import {AfterViewInit, Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../service/auth.service';
import {WebSocketService} from '../service/web-socket.service';
import {ToastrService} from 'ngx-toastr';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';


@Component({
  selector: 'app-authentification',
  templateUrl: './authentification.component.html',
  styleUrls: ['./authentification.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class AuthentificationComponent implements AfterViewInit {

  login: string = '';
  password: string = '';
  errorMessage: string = '';
  errorVisible: boolean = false;
  loading: boolean = false;

  private readonly authService = inject(AuthService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  ngAfterViewInit() {
    // Lazy load background image
    const img = new Image();
    img.src = '/assets/images/road_authenification.jpg';
    img.onload = () => {
      const authPage = document.querySelector('.auth-page');
      if (authPage) {
        authPage.classList.add('lazy-loaded');
      }
    };
  }

  onSubmit() {
    this.loading = true;
    this.authService.logout();

    this.authService.authentificate(this.login, this.password).subscribe({
      next: (_admin) => {
        this.loading = false;
        this.authService.saveSession(_admin);
        this.webSocketService.connect();
        localStorage.setItem("isReloading", "true");
        if (_admin.user?.role === 'AGENT') {
          this.router.navigate(['/adminWeb/listWebs']);
        } else {
          this.router.navigate(['/adminWeb/dashboard']);
        }
      },
      error: (_error) => {
        this.loading = false;
        this.errorVisible = true;
        this.errorMessage = "Login or password is incorrect";
        this.toastr.error('Username Or Password are incorrect', 'Login Error');
      }
    });
  }
}
