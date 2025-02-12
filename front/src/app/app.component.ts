import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet, RouterLink]
})
export class AppComponent {
  title = 'Hello World from Angular!';
}
