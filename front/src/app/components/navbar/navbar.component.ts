import { Component, OnInit, Renderer2, ElementRef, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  faSun = faSun;
  faMoon = faMoon;
  appName: string = 'MindCare';
  checked: boolean = false;
  isDashboard: boolean = false;

  @ViewChild('navToggle', { static: false })
  navToggle!: ElementRef<HTMLInputElement>;
  @ViewChild('navBackground', { static: false })
  navBackground!: ElementRef<HTMLDivElement>;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeTheme();
    this.setupRouteListener();

    // Vérifier la route actuelle au chargement initial
    this.checkIfDashboard(this.router.url);
  }

  ngAfterViewInit(): void {
    // Configurer le listener pour le clic à l'extérieur seulement si navBackground existe
    if (this.navBackground) {
      this.setupOutsideClickListener();
    }
  }

  setupRouteListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkIfDashboard(event.url);
      });
  }

  checkIfDashboard(url: string): void {
    // Vérifie si l'URL contient /dashboard
    this.isDashboard = url.includes('/dashboard');
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
    if (this.navBackground && this.navBackground.nativeElement) {
      this.renderer.listen(this.navBackground.nativeElement, 'click', () => {
        if (this.navToggle && this.navToggle.nativeElement && this.navToggle.nativeElement.checked) {
          this.navToggle.nativeElement.checked = false;
        }
      });
    }
  }
}
