import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <app-card>
      <p>Card Content</p>
    </app-card>
  `,
  imports: [CardComponent]
})
class TestHostComponent {}

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders content projection', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const card = hostFixture.debugElement.query(By.css('.card'));
    expect(card).toBeTruthy();
    const content = card.query(By.css('p'));
    expect(content.nativeElement.textContent).toContain('Card Content');
  });

  it('applies variant class', () => {
    fixture.componentRef.setInput('variant', 'elevated');
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('.card'));
    expect(card.nativeElement.classList.contains('variant-elevated')).toBeTruthy();
  });

  it('applies padding class', () => {
    fixture.componentRef.setInput('padding', 'sm');
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('.card'));
    expect(card.nativeElement.classList.contains('padding-sm')).toBeTruthy();
  });
});
