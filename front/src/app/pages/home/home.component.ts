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
      question: 'Comment fonctionne le suivi personnalisé ?',
      answer: 'Notre suivi personnalisé utilise des indicateurs adaptés à vos objectifs et besoins spécifiques. Vous recevez des notifications régulières, pouvez suivre vos progrès via des graphiques intuitifs, et votre praticien peut ajuster votre programme en fonction de votre évolution.',
      isOpen: false,
      style: {
        border: 'border-[#A855F7]',
        hover: 'hover:bg-[#A855F7]/5',
        icon: 'text-[#A855F7]'
      }
    },
    {
      question: 'Est-ce que mes informations sont sécurisées ?',
      answer: 'Absolument ! Nous prenons la sécurité de vos données très au sérieux. Toutes les informations sont cryptées selon les normes les plus strictes, et nous sommes conformes aux réglementations RGPD. Seuls vous et les professionnels de santé autorisés peuvent accéder à vos données.',
      isOpen: false,
      style: {
        border: 'border-[#4B70F5]',
        hover: 'hover:bg-[#4B70F5]/5',
        icon: 'text-[#4B70F5]'
      }
    },
    {
      question: 'Puis-je annuler une consultation en ligne ?',
      answer: "Oui, vous pouvez annuler ou reprogrammer une consultation jusqu'à 24 heures avant le rendez-vous prévu. Il vous suffit d'accéder à votre calendrier dans l'application et de gérer vos rendez-vous. Un remboursement complet est effectué pour les annulations respectant ce délai.",
      isOpen: false,
      style: {
        border: 'border-[#A855F7]',
        hover: 'hover:bg-[#A855F7]/5',
        icon: 'text-[#A855F7]'
      }
    },
    {
      question: 'Comment les ressources sont-elles personnalisées en fonction de mes besoins sur MindCare ?',
      answer: "Les ressources sont personnalisées grâce à un questionnaire initial détaillé et à l'analyse continue de vos interactions avec l'application. Notre système adapte les recommandations en fonction de vos objectifs, préférences et progrès, tout en prenant en compte les retours de votre praticien.",
      isOpen: false,
      style: {
        border: 'border-[#4B70F5]',
        hover: 'hover:bg-[#4B70F5]/5',
        icon: 'text-[#4B70F5]'
      }
    }
  ];

  toggleFaq(index: number): void {
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }
}
