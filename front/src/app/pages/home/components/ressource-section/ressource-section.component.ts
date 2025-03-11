import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faUser, faBriefcase } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-ressource-section',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  templateUrl: './ressource-section.component.html',
})
export class RessourceSectionComponent {
  faUser = faUser;
  faBriefcase = faBriefcase;
  appName = 'MindCare';
}
