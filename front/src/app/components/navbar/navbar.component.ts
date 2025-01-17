import {
  Component,
  OnInit,
  Renderer2,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  readonly icons = {
    Moon,
    Sun,
  };

  appName = 'MindCare';

  @ViewChild('navToggle', { static: true })
  navToggle!: ElementRef<HTMLInputElement>;
  @ViewChild('navBackground', { static: true })
  navBackground!: ElementRef<HTMLDivElement>;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    this.toggleThemeMode();
    this.setupOutsideClickListener();
  }

  toggleThemeMode(): void {
    const themeToggleBtn: HTMLElement | null = document.getElementById(
      'dropdownDefaultButton',
    );
    const dropdownMenu: HTMLElement | null =
      document.getElementById('dropdown');
    const lightModeBtn: HTMLElement | null =
      document.getElementById('light-mode');
    const darkModeBtn: HTMLElement | null =
      document.getElementById('dark-mode');
    const systemModeBtn: HTMLElement | null =
      document.getElementById('system-mode');

    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');

    themeToggleBtn?.addEventListener('click', (): void => {
      dropdownMenu?.classList.toggle('hidden');
    });

    lightModeBtn?.addEventListener('click', (): void => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      dropdownMenu?.classList.toggle('hidden');
    });

    darkModeBtn?.addEventListener('click', (): void => {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      dropdownMenu?.classList.toggle('hidden');
    });

    systemModeBtn?.addEventListener('click', (): void => {
      localStorage.removeItem('theme');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      dropdownMenu?.classList.toggle('hidden');
    });

    if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
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
