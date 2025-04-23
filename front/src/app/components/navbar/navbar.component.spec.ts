import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, FormsModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    component.initializeTheme();
    expect(component.checked).toBeTruthy();
    expect(document.documentElement.classList.contains('dark')).toBeTruthy();
  });

  it('should toggle theme', () => {
    component.checked = true;
    component.toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBeTruthy();
    expect(localStorage.getItem('theme')).toBe('dark');

    component.checked = false;
    component.toggleTheme();
    expect(document.documentElement.classList.contains('light')).toBeTruthy();
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should detect dashboard routes', () => {
    component.checkIfDashboard('/dashboard');
    expect(component.isDashboard).toBeTruthy();

    component.checkIfDashboard('/dashboard/profile');
    expect(component.isDashboard).toBeTruthy();

    component.checkIfDashboard('/');
    expect(component.isDashboard).toBeFalsy();

    component.checkIfDashboard('/contact');
    expect(component.isDashboard).toBeFalsy();
  });
});
