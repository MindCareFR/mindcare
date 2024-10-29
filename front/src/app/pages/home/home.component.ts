import { Component } from '@angular/core';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { FooterComponent } from '@components/footer/footer.component';

@Component({
  selector: 'app-app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
})
export class AppHomeComponent {
  title = 'Hello World from Angular!';
}
