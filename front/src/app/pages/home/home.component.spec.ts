import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppHomeComponent } from './home.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppHomeComponent', () => {
  let component: AppHomeComponent;
  let fixture: ComponentFixture<AppHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppHomeComponent,
        FontAwesomeModule
      ],
      schemas: [NO_ERRORS_SCHEMA] // To ignore custom elements like app-navbar in tests
    }).compileComponents();

    fixture = TestBed.createComponent(AppHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle FAQ items', () => {
    // Initial state should be closed
    expect(component.faqItems[0].isOpen).toBe(false);

    // Toggle the FAQ item
    component.toggleFaq(0);

    // After toggle, it should be open
    expect(component.faqItems[0].isOpen).toBe(true);

    // Toggle again
    component.toggleFaq(0);

    // Should be closed again
    expect(component.faqItems[0].isOpen).toBe(false);
  });
});
