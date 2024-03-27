import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompteWebComponentComponent } from './add-compte-web-component.component';

describe('AddCompteWebComponentComponent', () => {
  let component: AddCompteWebComponentComponent;
  let fixture: ComponentFixture<AddCompteWebComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCompteWebComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCompteWebComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
