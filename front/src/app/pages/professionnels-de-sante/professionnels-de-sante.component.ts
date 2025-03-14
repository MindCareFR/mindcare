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
  currentPage = 1;
  pageSize = 12;
  doctors = [
    {
      name: 'Dr. Alice',
      note: 9,
      ans: 15,
      diplome: 'PhD',
      approche: 'Cognitive Therapy',
      travaux: 'Anxiety, Depression',
      histoire: "Je suis psychologue clinicienne, Gestalt thérapeute. J'aide les gens a « faire le tri », a résoudre les problémes actuels et les difficultés dans les relations avec les autres, a apporter",
      image: 'https://picsum.photos/200/300',
      activeTab: 'principal'
    },
    { name: 'Dr. Bob',
      note: 8,
      ans: 10,
      diplome: 'MD',
      approche: 'Behavioral Therapy',
      travaux: 'PTSD, Stress',
      histoire: 'Former military psychiatrist',
      image: 'https://picsum.photos/200/300',
      activeTab: 'principal' },
    { name: 'Dr. Bob',
      note: 8,
      ans: 10,
      diplome: 'MD',
      approche: 'Behavioral Therapy',
      travaux: 'PTSD, Stress',
      histoire: 'Former military psychiatrist',
      image: 'https://picsum.photos/200/300',
      activeTab: 'principal'
    },
    { name: 'Dr. Bob',
      note: 8,
      ans: 10,
      diplome: 'MD',
      approche: 'Behavioral Therapy',
      travaux: 'PTSD, Stress',
      histoire: 'Former military psychiatrist',
      image: 'https://picsum.photos/200/300',
      activeTab: 'principal'
    },
    { name: 'Dr. Bob',
      note: 8,
      ans: 10,
      diplome: 'MD',
      approche: 'Behavioral Therapy',
      travaux: 'PTSD, Stress',
      histoire: 'Former military psychiatrist',
      image: 'https://picsum.photos/200/300',
      activeTab: 'principal'
    },
  ];

  get paginatedDoctors() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.doctors.slice(startIndex, startIndex + this.pageSize);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.doctors.length) {
      this.currentPage++;
    }
  }
}
