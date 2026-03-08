import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { RecalculWebComponent } from './recalcul-web.component';

describe('RecalculWebComponent', () => {
  let component: RecalculWebComponent;
  let fixture: ComponentFixture<RecalculWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideRouter([]), importProvidersFrom(ToastrModule.forRoot())],
    imports: [RecalculWebComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(RecalculWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
