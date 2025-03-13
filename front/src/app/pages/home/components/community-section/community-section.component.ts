import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faUser, faBriefcase } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-community-section',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './community-section.component.html',
})
export class CommunitySectionComponent {
  faUser = faUser;
  faBriefcase = faBriefcase;
  appName = 'MindCare';
}
