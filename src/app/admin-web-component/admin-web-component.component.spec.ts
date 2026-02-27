import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWebComponentComponent } from './admin-web-component.component';

describe('AdminWebComponentComponent', () => {
  let component: AdminWebComponentComponent;
  let fixture: ComponentFixture<AdminWebComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [AdminWebComponentComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminWebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
