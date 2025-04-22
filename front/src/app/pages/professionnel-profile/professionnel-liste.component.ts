import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FooterComponent } from '@components/footer/footer.component';
import { NavbarComponent } from '@components/navbar/navbar.component';
import {Professional, ProfessionalsService} from '@services/professionnel-liste.service';

@Component({
  selector: 'app-psychologues',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './professionnel-liste.component.html',
})
export class ProfessionalsComponent implements OnInit {
  professionals: Professional[] = [];
  filteredProfessionals: Professional[] = [];

  // États de chargement et erreurs
  loading: boolean = true;
  error: string | null = null;

  // Filtres
  selectedSymptoms: string[] = [];
  selectedApproaches: string[] = [];
  selectedSex: string = '';
  sortBy: string = 'recommended';

  // États d'affichage des dropdowns
  showSymptomDropdown: boolean = false;
  showApproachDropdown: boolean = false;
  showSortDropdown: boolean = false;

  // Listes des options de filtres
  availableSymptoms: string[] = [];
  availableApproaches: string[] = [];

  constructor(
    private professionalsService: ProfessionalsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfessionals();
    this.availableSymptoms = this.professionalsService.getSymptoms();
    this.availableApproaches = this.professionalsService.getApproaches();
  }

  loadProfessionals(): void {
    this.loading = true;
    this.error = null;
    this.selectedSymptoms = [];
    this.selectedApproaches = [];
    this.selectedSex = '';
    this.sortBy = 'recommended';

    this.professionalsService.getProfessionals().subscribe({
      next: (data: Professional[]) => {
        this.professionals = data;
        this.filteredProfessionals = [...data];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des professionnels:', err);
        this.error = 'Impossible de charger la liste des professionnels.';
        this.loading = false;
      }
    });
  }

  // Méthodes pour gérer les filtres
  filterBySymptom(symptom: string): void {
    const index = this.selectedSymptoms.indexOf(symptom);
    if (index === -1) {
      this.selectedSymptoms.push(symptom);
    } else {
      this.selectedSymptoms.splice(index, 1);
    }
    this.applyFilters();
  }

  filterByApproach(approach: string): void {
    const index = this.selectedApproaches.indexOf(approach);
    if (index === -1) {
      this.selectedApproaches.push(approach);
    } else {
      this.selectedApproaches.splice(index, 1);
    }
    this.applyFilters();
  }

  filterBySex(sex: string): void {
    this.selectedSex = this.selectedSex === sex ? '' : sex;
    this.applyFilters();
  }

  sortProfessionals(criteria: string): void {
    this.sortBy = criteria;
    this.applyFilters();
    this.showSortDropdown = false;
  }

  applyFilters(): void {
    // Filtrage côté client
    let result = [...this.professionals];

    // Filtre par symptômes
    if (this.selectedSymptoms.length > 0) {
      result = result.filter(pro =>
        this.selectedSymptoms.some(symptom =>
            pro.themes && pro.themes.some(theme =>
              theme.toLowerCase().includes(symptom.toLowerCase())
            )
        )
      );
    }

    // Filtre par approche
    if (this.selectedApproaches.length > 0) {
      result = result.filter(pro =>
        this.selectedApproaches.some(approach =>
            pro.approaches && pro.approaches.some(a =>
              a.toLowerCase().includes(approach.toLowerCase())
            )
        )
      );
    }

    // Filtre par sexe
    if (this.selectedSex) {
      result = result.filter(pro => pro.gender === this.selectedSex);
    }

    // Tri
    switch (this.sortBy) {
      case 'recommended':
        // Mélange de note et expérience
        result.sort((a, b) => ((b.rating || 0) + (b.experience || 0)/10) - ((a.rating || 0) + (a.experience || 0)/10));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'experience':
        result.sort((a, b) => (b.experience || 0) - (a.experience || 0));
        break;
    }

    this.filteredProfessionals = result;
  }

  // Gestion des dropdowns
  toggleSymptomFilter(): void {
    this.showSymptomDropdown = !this.showSymptomDropdown;
    this.showApproachDropdown = false;
    this.showSortDropdown = false;
  }

  toggleApproachFilter(): void {
    this.showApproachDropdown = !this.showApproachDropdown;
    this.showSymptomDropdown = false;
    this.showSortDropdown = false;
  }

  toggleSexFilter(): void {
    // Cycle entre M, F et vide
    if (this.selectedSex === '') {
      this.selectedSex = 'M';
    } else if (this.selectedSex === 'M') {
      this.selectedSex = 'F';
    } else {
      this.selectedSex = '';
    }
    this.applyFilters();
  }

  toggleSortOptions(): void {
    this.showSortDropdown = !this.showSortDropdown;
    this.showSymptomDropdown = false;
    this.showApproachDropdown = false;
  }

  closeDropdowns(): void {
    this.showSymptomDropdown = false;
    this.showApproachDropdown = false;
    this.showSortDropdown = false;
  }

  viewProfile(id: number): void {
    // Navigation vers la page de profil du professionnel
    this.router.navigate(['/professional', id]);
  }

  // Méthode pour récupérer le nom complet
  getFullName(professional: Professional): string {
    return `${professional.firstname} ${professional.lastname}`;
  }

  // Vérifier si un symptôme est sélectionné
  isSymptomSelected(symptom: string): boolean {
    return this.selectedSymptoms.includes(symptom);
  }

  // Vérifier si une approche est sélectionnée
  isApproachSelected(approach: string): boolean {
    return this.selectedApproaches.includes(approach);
  }

  // Obtenir le label du tri actuel
  getSortLabel(): string {
    switch (this.sortBy) {
      case 'recommended':
        return 'Recommandé';
      case 'rating':
        return 'Note';
      case 'experience':
        return 'Expérience';
      default:
        return 'Recommandé';
    }
  }
}
