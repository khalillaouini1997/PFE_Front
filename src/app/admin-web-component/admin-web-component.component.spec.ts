import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { AdminWebComponentComponent } from './admin-web-component.component';

describe('AdminWebComponentComponent', () => {
  let component: AdminWebComponentComponent;
  let fixture: ComponentFixture<AdminWebComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        importProvidersFrom(ToastrModule.forRoot())
      ],
      imports: [AdminWebComponentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminWebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
