import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faUser, faBriefcase } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-method-section',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './method-section.component.html',
})
export class MethodSectionComponent {
  faUser = faUser;
  faBriefcase = faBriefcase;
  appName = 'MindCare';
}
