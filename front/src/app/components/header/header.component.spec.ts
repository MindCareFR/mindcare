// header.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './header.component';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, FormsModule, ToggleSwitchModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
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
});
