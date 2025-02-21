import { Component, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [RouterOutlet],
})
export class AppComponent {
  title = 'Hello World from Angular!';

  constructor(private renderer: Renderer2) {
    this.renderer.addClass(document.body, 'bg-white');
    this.renderer.addClass(document.body, 'dark:bg-gray-900');
  }
}