import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { VehiculeInfoComponent } from './vehicule-info.component';

describe('VehiculeInfoComponent', () => {
  let component: VehiculeInfoComponent;
  let fixture: ComponentFixture<VehiculeInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideRouter([]), importProvidersFrom(ToastrModule.forRoot())],
    imports: [VehiculeInfoComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
