import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

import { ComptesServerComponentComponent } from './comptes-server-component.component';

describe('ComptesServerComponentComponent', () => {
  let component: ComptesServerComponentComponent;
  let fixture: ComponentFixture<ComptesServerComponentComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(ToastrModule.forRoot())
      ],
      imports: [ComptesServerComponentComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ComptesServerComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
