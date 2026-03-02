import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CoreService } from 'src/app/service/core.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
  standalone: true
})
export class ErrorComponent {

  private readonly router = inject(Router);
  private readonly coreService = inject(CoreService);

  constructor() {
    this.coreService.changeBackgroundImageTo(0);
  }

  back() {
    this.router.navigate(['/authentification']);
  }
}
