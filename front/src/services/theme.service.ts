import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$ = this.darkModeSubject.asObservable();
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    // Initialiser à la création du service
    this.initializeTheme();
  }

  get isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  toggleTheme(): void {
    const newValue = !this.darkModeSubject.value;
    this.darkModeSubject.next(newValue);
    localStorage.setItem('darkMode', JSON.stringify(newValue));
    this.applyThemeToDocument(newValue);
  }

  initializeTheme(): void {
    const savedMode = localStorage.getItem('darkMode');

    if (savedMode !== null) {
      const isDarkMode = JSON.parse(savedMode);
      this.darkModeSubject.next(isDarkMode);
      this.applyThemeToDocument(isDarkMode);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkModeSubject.next(prefersDark);
      localStorage.setItem('darkMode', JSON.stringify(prefersDark));
      this.applyThemeToDocument(prefersDark);
    }
  }

  private applyThemeToDocument(isDark: boolean): void {
    if (isDark) {
      this.renderer.addClass(document.documentElement, 'dark');
      this.renderer.addClass(document.body, 'dark-mode');
      this.renderer.setStyle(document.body, 'background-color', '#111827');
      this.renderer.setStyle(document.body, 'color', '#ffffff');
    } else {
      this.renderer.removeClass(document.documentElement, 'dark');
      this.renderer.removeClass(document.body, 'dark-mode');
      this.renderer.removeStyle(document.body, 'background-color');
      this.renderer.removeStyle(document.body, 'color');
    }
  }
}
