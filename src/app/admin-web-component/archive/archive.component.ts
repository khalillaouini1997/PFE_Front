import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TabsetComponent, TabsModule } from "ngx-bootstrap/tabs";
import { Archive, raws } from "../../data/data";
import { BoitierService } from "../../service/boitier.service";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';


@Component({
    selector: 'app-archive',
    templateUrl: './archive.component.html',
    styleUrls: ['./archive.component.css'],
    imports: [FormsModule, ReactiveFormsModule, TabsModule]
})
export class ArchiveComponent implements OnInit {
  @ViewChild('staticTabs') staticTabs: TabsetComponent;
  archives: Archive[] = [];
  raws: raws = new raws();
  numBoitier: number;
  archiveForm!: FormGroup;

  constructor(private _location: Location, private route: ActivatedRoute, private boitierService: BoitierService, private router: Router, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForms();
    this.route.params.subscribe((params: Params) => {
      this.numBoitier = (+params['numBoitier']);
    });
    this.getArchives();
  }

  initForms() {
    this.archiveForm = this.fb.group({
      limit: [200]
    });
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
    const limit = this.archiveForm.get('limit')?.value || 200;
    this.boitierService.getRaws(this.numBoitier, limit).subscribe((_raws: any) => {
      this.raws.raws = _raws.raws;
      this.raws.count = _raws.count;
    });
  }

  //=====================================
  // Get archive of device form database
  //
  //=====================================
  getArchives() {
    const limit = this.archiveForm.get('limit')?.value || 200;
    this.boitierService.getArchiveOfBoitier(this.numBoitier, limit).subscribe(_archives => {
      this.archives = _archives as any;
      for (let i = 0; i < this.archives.length; i++) {
        this.archives[i].latitude = (+this.archives[i].latitude.toFixed(5));
        this.archives[i].longitude = (+this.archives[i].longitude.toFixed(5));
      }
    });
  }
}
