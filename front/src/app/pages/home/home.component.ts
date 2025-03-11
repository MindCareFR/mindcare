import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faUser, faBriefcase, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { NavbarComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { CommunitySectionComponent } from './components/community-section/community-section.component';
import { MethodSectionComponent } from './components/method-section/method-section.component';
import { RessourceSectionComponent } from './components/ressource-section/ressource-section.component';
import { ProfessionelSectionComponent } from './components/professionel-section/professionel-section.component';
import { AvisSectionComponent } from './components/avis-section/avis-section.component';
import { FaqSectionComponent } from './components/faq-section/faq-section.component';

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
  style: {
    border: string;
    hover: string;
    icon: string;
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    NavbarComponent,
    FooterComponent,
    HeroSectionComponent,
    CommunitySectionComponent,
    MethodSectionComponent,
    RessourceSectionComponent,
    ProfessionelSectionComponent,
    AvisSectionComponent,
    FaqSectionComponent,
  ],
  templateUrl: './home.component.html',
})
export class AppHomeComponent {
  faUser = faUser;
  faBriefcase = faBriefcase;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  appName = 'MindCare';
}
