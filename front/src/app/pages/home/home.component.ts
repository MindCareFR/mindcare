import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faUser, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { NavbarComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';

@Component({
  selector: 'app-app-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, NavbarComponent, FooterComponent ], // Suppression des composants inutilisés
  templateUrl: './home.component.html',
})
export class AppHomeComponent {
  faUser = faUser;
  faBriefcase = faBriefcase;
  appName: string = 'MindCare';

}
