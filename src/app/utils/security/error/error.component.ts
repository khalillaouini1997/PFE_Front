import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';
import { CoreService } from 'src/app/service/core.service';

/**
 * created by AHMED HAYEL
 */

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  constructor( private service: DataService, private router: Router, private coreService:CoreService) {
    coreService.changeBackgroundImageTo(0);
  }

  ngOnInit() {
  }
  back() {
    //this._location.back();
    this.router.navigate(['/authentification'])
  }

}
