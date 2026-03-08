import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { AddCompteWebComponentComponent } from './add-compte-web-component.component';

describe('AddCompteWebComponentComponent', () => {
  let component: AddCompteWebComponentComponent;
  let fixture: ComponentFixture<AddCompteWebComponentComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [AddCompteWebComponentComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCompteWebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
