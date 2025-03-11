import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faUser, faBriefcase } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-avis-section',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  templateUrl: './avis-section.component.html',
})
export class AvisSectionComponent {
  faUser = faUser;
  faBriefcase = faBriefcase;
  appName = 'MindCare';
}
