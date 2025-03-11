import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faUser, faBriefcase } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-professionel-section',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  templateUrl: './professionel-section.component.html',
})
export class ProfessionelSectionComponent {
  faUser = faUser;
  faBriefcase = faBriefcase;
  appName = 'MindCare';
}
