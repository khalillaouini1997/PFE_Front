import { Location, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TabsetComponent, TabsModule } from "ngx-bootstrap/tabs";
import { Archive,raws, raw } from "../../data/data";
import { CompteServerService } from "../../service/compte-server.service";
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-archive',
    templateUrl: './archive.component.html',
    styleUrls: ['./archive.component.css'],
    standalone: true,
    imports: [FormsModule, TabsModule, NgFor, NgIf]
})
export class ArchiveComponent implements OnInit {
  @ViewChild('staticTabs') staticTabs: TabsetComponent;
  archives: Archive[] = [];
  raws: raws = new raws();
  numBoitier: number;

  limit: number = 200;

  constructor(private _location: Location, private route: ActivatedRoute, private compteServerService: CompteServerService, private router: Router) { }

  ngOnInit() {
    // if (this.service.isAuthenticated == false) {
    // this.router.navigate(['/error']);
    //} else {
    this.route.params.subscribe((params: Params) => {
      this.numBoitier = (+params['numBoitier']);
    });
    this.getArchives();
    // }

  }

  //=====================================
  //     Go back to the previous page
  //=====================================

  back() {
    this._location.back();
  }

  //=====================================
  //     Get all device's raw
  //=====================================

  getAllRaws() {

    this.compteServerService.getRaws(this.numBoitier,this.limit).subscribe(_raws => {
      this.raws.raws = _raws.raws;
      this.raws.count = _raws.count;
    });
  }

  //=====================================
  // Get archive of device form database
  //
  //=====================================
  getArchives(){
    this.compteServerService.getArchiveOfBoitier(this.numBoitier,this.limit).subscribe(_archives => {
      this.archives = _archives;
      for (let i = 0; i < this.archives.length; i++) {
        this.archives[i].latitude = (+this.archives[i].latitude.toFixed(5));
        this.archives[i].longitude = (+this.archives[i].longitude.toFixed(5));
      }
    });
  }
}
