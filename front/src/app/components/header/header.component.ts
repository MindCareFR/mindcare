import { Component, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './header.component.html',
})
export class NavbarComponent implements OnInit {
  faSun = faSun;
  faMoon = faMoon;
  appName: string = 'MindCare';
  checked: boolean = false;

  @ViewChild('navToggle', { static: true })
  navToggle!: ElementRef<HTMLInputElement>;
  @ViewChild('navBackground', { static: true })
  navBackground!: ElementRef<HTMLDivElement>;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.initializeTheme();
    this.setupOutsideClickListener();
  }

  initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.checked = true;
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (savedTheme === 'light') {
      this.checked = false;
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      // System preference
      this.checked = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (this.checked) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  }

  toggleTheme(): void {
    this.checked = !this.checked; // Important : inverser l'état avant d'appliquer les changements
    if (this.checked) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }

  setupOutsideClickListener(): void {
    this.renderer.listen(this.navBackground.nativeElement, 'click', () => {
      if (this.navToggle.nativeElement.checked) {
        this.navToggle.nativeElement.checked = false;
      }
    });
  }
}
