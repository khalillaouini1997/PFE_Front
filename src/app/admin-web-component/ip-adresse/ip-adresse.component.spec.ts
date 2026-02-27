import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpAdresseComponent } from './ip-adresse.component';

describe('IpAdresseComponent', () => {
  let component: IpAdresseComponent;
  let fixture: ComponentFixture<IpAdresseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [IpAdresseComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpAdresseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
