import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Initialiser le thème dès le démarrage de l'application
    this.themeService.initializeTheme();

    // S'assurer que les changements de thème sont appliqués au document HTML et au body
    this.themeService.darkMode$.subscribe(isDark => {
      if (isDark) {
        this.renderer.addClass(document.documentElement, 'dark');
        this.renderer.addClass(document.body, 'dark-mode');
        // Ajouter des classes au body pour s'assurer que le fond est correctement appliqué
        this.renderer.setStyle(document.body, 'background-color', '#111827'); // Couleur bg-gray-900 de Tailwind
        this.renderer.setStyle(document.body, 'color', '#ffffff');
      } else {
        this.renderer.removeClass(document.documentElement, 'dark');
        this.renderer.removeClass(document.body, 'dark-mode');
        this.renderer.removeStyle(document.body, 'background-color');
        this.renderer.removeStyle(document.body, 'color');
      }
    });
  }
}
