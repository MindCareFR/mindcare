import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faUser, faBriefcase, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { NavbarComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';

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
    FooterComponent
  ],
  templateUrl: './home.component.html',
})
export class AppHomeComponent {
  faUser = faUser;
  faBriefcase = faBriefcase;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  appName = 'MindCare';

  faqItems: FaqItem[] = [
    {
      question: "Comment puis-je prendre rendez-vous avec un professionnel ?",
      answer: "Vous pouvez prendre rendez-vous directement depuis votre tableau de bord en cliquant sur 'Trouver un professionnel', puis en sélectionnant le professionnel qui vous convient et un créneau disponible dans son agenda.",
      isOpen: false,
      style: {
        border: "border-gray-200 dark:border-gray-700",
        hover: "hover:bg-gray-50 dark:hover:bg-gray-800",
        icon: "text-indigo-600"
      }
    },
    {
      question: "Les consultations en ligne sont-elles sécurisées ?",
      answer: "Oui, toutes nos consultations en ligne sont cryptées de bout en bout et respectent les normes de sécurité les plus strictes en matière de confidentialité des données de santé.",
      isOpen: false,
      style: {
        border: "border-gray-200 dark:border-gray-700",
        hover: "hover:bg-gray-50 dark:hover:bg-gray-800",
        icon: "text-indigo-600"
      }
    },
    {
      question: "Comment puis-je accéder aux ressources thérapeutiques ?",
      answer: "Les ressources thérapeutiques sont accessibles depuis votre espace personnel. Vous pouvez les filtrer par catégorie (méditation, gestion du stress, sommeil, etc.) ou suivre les recommandations personnalisées.",
      isOpen: false,
      style: {
        border: "border-gray-200 dark:border-gray-700",
        hover: "hover:bg-gray-50 dark:hover:bg-gray-800",
        icon: "text-indigo-600"
      }
    },
    {
      question: "Quels sont les tarifs pour les professionnels ?",
      answer: "Nous proposons plusieurs formules d'abonnement adaptées aux besoins des professionnels. L'offre de base est gratuite avec des fonctionnalités limitées, tandis que nos offres Premium et Pro offrent des outils avancés pour optimiser votre pratique.",
      isOpen: false,
      style: {
        border: "border-gray-200 dark:border-gray-700",
        hover: "hover:bg-gray-50 dark:hover:bg-gray-800",
        icon: "text-indigo-600"
      }
    }
  ];

  toggleFaq(index: number): void {
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }
}
