import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComptesWebComponentComponent } from './comptes-web-component.component';

describe('ComptesWebComponentComponent', () => {
  let component: ComptesWebComponentComponent;
  let fixture: ComponentFixture<ComptesWebComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComptesWebComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComptesWebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
