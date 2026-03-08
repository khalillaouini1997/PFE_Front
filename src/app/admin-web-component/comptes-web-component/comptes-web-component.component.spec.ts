import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { ComptesWebComponentComponent } from './comptes-web-component.component';

describe('ComptesWebComponentComponent', () => {
  let component: ComptesWebComponentComponent;
  let fixture: ComponentFixture<ComptesWebComponentComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [ComptesWebComponentComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComptesWebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
