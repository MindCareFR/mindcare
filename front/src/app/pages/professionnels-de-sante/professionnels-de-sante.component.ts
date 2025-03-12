import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';


@Component({
  selector: 'app-professionnels-de-sante',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    AvatarModule,
    AvatarGroupModule,
    ButtonModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './professionnels-de-sante.component.html',
})
export class ProfessionnelsDeSanteComponent {
  activeTab: string = "principal";
  name: string ="Nom prenom";
  note: number = 9;
  ans: number = 5;
  diplome: string = "BAC+3";
  Approche: string = "Gestalt-thérapie, approche systémique de la famille";
  Travaux: string = "Peur et crises d'angoisse, Dépendance émotionnelle, Stress";
  histoire: string = "Je suis psychologue clinicienne, Gestalt thérapeute. J'aide les gens a « faire le tri », a résoudre les problémes actuels et les difficultés dans les relations avec les autres, a apporter"

}
