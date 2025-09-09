import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { NavbarComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { FiltresComponent } from '@components/filtres/filtres.component';
import { FiltersPayload, FilterDef } from '@interfaces/profesionnel.interface';


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
    FiltresComponent,
  ],
  templateUrl: './professionnels-de-sante.component.html',
})

export class ProfessionnelsDeSanteComponent {
  currentPage = 1;
  pageSize = 12;

  selectedFilters: FiltersPayload = {
    symptoms: [],
    approach: [],
    sex: [],
    recommended: [],
    diplome: [],
  };

  doctors = [
    {
      name: 'Alice', lastname: 'Moireau', sex: 'Femme',
      note: 9, ans: 15, diplome: 'PhD',
      approche: 'Cognitive Therapy',
      travaux: 'Anxiety, Depression',
      histoire: '...',
      image: 'https://picsum.photos/200/300',
      activeTab: 'principal',
    },
    {
      name: 'Bruno', lastname: 'Lacombe', sex: 'Homme',
      note: 8, ans: 6, diplome: 'MSc',
      approche: 'Gestalt',
      travaux: 'Stress, Insomnie',
      histoire: '...',
      image: 'https://picsum.photos/200/301',
      activeTab: 'principal',
    },
  ];

  get filteredDoctors() {
    const f = this.selectedFilters;
    const hasAny =
      f.symptoms.length || f.approach.length || f.sex.length || f.recommended.length;
    if (!hasAny) return this.doctors;

    return this.doctors.filter(d => this.matchesDoctor(d, f));
  }

  private matchesDoctor(d: any, f: FiltersPayload): boolean {
  const lc = (s: string) => (s || '').toLowerCase();
  const STRONG_DIPLOMAS = ['md', 'des', 'phd'];

  if (f.approach.length && !f.approach.some(a => lc(d.approche).includes(lc(a)))) return false;

  if (f.symptoms.length && !f.symptoms.every(s => lc(d.travaux).includes(lc(s)))) return false;

  if (f.sex.length && !f.sex.includes(d.sex)) return false;

  if (f.diplome.length && !f.diplome.some(dip => lc(d.diplome).includes(lc(dip)))) return false;

  if (f.recommended.length) {
    const okTop   = !f.recommended.includes('Top')      || d.note >= 9;
    const okTrend = !f.recommended.includes('Tendance') || d.ans  >= 10;

    // 👇 here are the diplomas for "Pro.")
    const okPro   = !f.recommended.includes('Pro') ||
      STRONG_DIPLOMAS.some(sd => lc(d.diplome).includes(sd));

    if (!(okTop && okTrend && okPro)) return false;
  }

  return true;
}


  get paginatedDoctors() {
    const list = this.filteredDoctors;
    const start = (this.currentPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  previousPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void {
    if (this.currentPage * this.pageSize < this.filteredDoctors.length) this.currentPage++;
  }

  onFiltersChange(payload: FiltersPayload): void {
    this.selectedFilters = payload;
    this.currentPage = 1;
  }

  truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + '...';
    }
}
