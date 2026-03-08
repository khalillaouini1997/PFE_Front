import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { CompteAdminComponent } from './compte-admin.component';

describe('CompteAdminComponent', () => {
  let component: CompteAdminComponent;
  let fixture: ComponentFixture<CompteAdminComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [CompteAdminComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompteAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
