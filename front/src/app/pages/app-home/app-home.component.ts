import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-app-home',
  standalone: true,
  imports: [
    NavbarComponent
  ],
  templateUrl: './app-home.component.html',
})
export class AppHomeComponent {
  title = 'Hello World from Angular!';
}
