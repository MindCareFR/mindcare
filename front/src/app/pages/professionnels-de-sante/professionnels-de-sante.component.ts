import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from '@components/header/header.component';



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
  ],
  templateUrl: './professionnels-de-sante.component.html',
})
export class ProfessionnelsDeSanteComponent {
  activeTab: string = "principal";
  name: string ="Nom prenom";
  note: number = 9;
  ans: number = 5;
  diplome: string = "BAC+3";

}
