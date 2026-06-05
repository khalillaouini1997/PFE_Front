import { CommonModule, DatePipe, DecimalPipe, Location, NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Archive, raws, BoitierAnalysis } from "../../data/data";

import { BoitierService } from "../../service/boitier.service";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-archive',
  standalone: true,
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, TabsModule, DatePipe, DecimalPipe, NgClass, TranslateModule]
})
export class ArchiveComponent implements OnInit {
  archives = signal<Archive[]>([]);
  rawData = signal<raws>(new raws());
  numBoitier = signal<number>(0);
  archiveForm!: FormGroup;

  analysisData = signal<BoitierAnalysis | null>(null);
  isAnalyzing = signal<boolean>(false);
  analysisDays = signal<number>(30);


  constructor(
    private readonly _location: Location,
    private readonly route: ActivatedRoute,
    private readonly boitierService: BoitierService,
    private readonly router: Router,
    private readonly fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.route.params.subscribe((params: Params) => {
      this.numBoitier.set(+params['numBoitier']);
    });
    this.getArchives();
  }

  initForms() {
    this.archiveForm = this.fb.group({
      limit: [200]
    });
  }

  back() {
    this._location.back();
  }

  getAllRaws() {
    const limit = this.archiveForm.get('limit')?.value || 200;
    this.boitierService.getRaws(this.numBoitier(), limit).subscribe((_raws: any) => {
      const updatedRaws = new raws();
      updatedRaws.raws = _raws.raws;
      updatedRaws.count = _raws.count;
      this.rawData.set(updatedRaws);
    });
  }

  getArchives() {
    const limit = this.archiveForm.get('limit')?.value || 200;
    this.boitierService.getArchiveOfBoitier(this.numBoitier(), limit).subscribe(_archives => {
      const archs = (_archives as any[]).map(a => {
        // Parse date from DD-MM-YYYY HH:mm:ss format to Date object
        let parsedDate = a.date;
        if (a.date && typeof a.date === 'string') {
          const parts = a.date.split(' ');
          if (parts.length === 2) {
            const dateParts = parts[0].split('-');
            const timeParts = parts[1].split(':');
            if (dateParts.length === 3 && timeParts.length === 3) {
              parsedDate = new Date(
                parseInt(dateParts[2]), // year
                parseInt(dateParts[1]) - 1, // month (0-indexed)
                parseInt(dateParts[0]), // day
                parseInt(timeParts[0]), // hours
                parseInt(timeParts[1]), // minutes
                parseInt(timeParts[2]) // seconds
              );
            }
          }
        }
        return {
          ...a,
          date: parsedDate,
          latitude: +a.latitude.toFixed(5),
          longitude: +a.longitude.toFixed(5)
        };
      });
      this.archives.set(archs);
    });
  }

  getAiAnalysis() {
    this.isAnalyzing.set(true);
    this.boitierService.getBoitierAnalysis(this.numBoitier(), this.analysisDays()).subscribe({
      next: (data) => {
        this.analysisData.set(data);
        this.isAnalyzing.set(false);
      },
      error: (err) => {
        console.error('Error fetching AI analysis', err);
        this.isAnalyzing.set(false);
      }
    });
  }

  changeDays(days: number) {
    this.analysisDays.set(days);
    this.getAiAnalysis();
  }
}

