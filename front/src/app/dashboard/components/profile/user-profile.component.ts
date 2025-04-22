import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '@services/profile.service';
import { Router } from '@angular/router';
import { ProfileFormComponent } from './profile-form/profile-form.component';
import { PasswordFormComponent } from './password-form/password-form.component';

export interface ProfileData {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  address?: string;
  address_complement?: string;
  zipcode?: string;
  city?: string;
  country?: string;
  birthdate?: string;
  role?: { name: string };
  professional?: {
    company_name?: string;
    medical_identification_number?: string;
    company_identification_number?: string;
    biography?: string;
    experience?: number;
    certification?: string;
    languages?: string[];
    specialties?: string[];
    is_anonymous?: boolean;
    availability_hours?: Record<string, string[]>;
    therapy_domains?: any[];
  };
  patient?: {
    gender?: string;
    birthdate?: string;
    is_anonymous?: boolean;
  };
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  templateUrl: './user-profile.component.html',
  imports: [CommonModule, FormsModule, ProfileFormComponent, PasswordFormComponent],
})
export class UserProfileComponent implements OnInit {
  // Données du profil
  profileData: ProfileData = {
    firstname: 'Utilisateur',
    lastname: '',
    email: '',
    role: { name: 'ROLE_PATIENT' }, // Valeur par défaut
  };

  // États UI
  loading = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  loadFailed = false;

  // États des modales de formulaire
  showProfileForm = false;
  showPasswordForm = false;

  constructor(
    private readonly profileService: ProfileService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfileData();
  }

  // Méthode pour obtenir les initiales de l'utilisateur
  getInitials(): string {
    const firstname = this.profileData?.firstname || 'U';
    const lastname = this.profileData?.lastname || '';

    const firstInitial = firstname.charAt(0).toUpperCase();
    const lastInitial = lastname.charAt(0).toUpperCase();

    return firstInitial + (lastInitial || '');
  }

  // Charger les données du profil
  loadProfileData(): void {
    this.loading = true;
    this.errorMessage = null;
    this.loadFailed = false;

    // Vérifier si le token est présent
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Veuillez vous connecter pour accéder à votre profil';
      this.loading = false;
      this.loadFailed = true;
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }

    this.profileService.getProfile().subscribe({
      next: data => {
        console.log('Données du profil chargées:', data);

        if (!data) {
          this.errorMessage = 'Impossible de récupérer les données du profil';
          this.loadFailed = true;
          this.loading = false;
          return;
        }

        this.profileData = data;

        // Log des détails pour le débogage
        if (this.isProfessional() && this.profileData.professional) {
          console.log('Données professionnelles:', this.profileData.professional);
        }

        this.loading = false;
      },
      error: err => {
        console.error('Erreur de chargement du profil:', err);
        this.errorMessage =
          'Impossible de charger les données du profil. Essayez de vous reconnecter.';
        this.loadFailed = true;
        this.loading = false;

        // Si erreur d'authentification, rediriger vers la page de connexion
        if (err?.status === 401) {
          localStorage.removeItem('token');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        }
      },
    });
  }

  // Formatage de la date
  formatDate(dateString?: string): string {
    if (!dateString) return 'Non spécifiée';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  }

  // Obtenir un libellé pour le rôle
  getRoleLabel(): string {
    if (!this.profileData?.role?.name) return 'Utilisateur';

    switch (this.profileData.role.name) {
      case 'ROLE_PRO':
        return 'Professionnel de santé';
      case 'ROLE_PATIENT':
        return 'Patient';
      default:
        return this.profileData.role.name;
    }
  }

  // Activer/désactiver le mode anonyme
  toggleAnonymousMode(): void {
    if (!this.isProfessional()) return;

    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.profileService.toggleAnonymousMode().subscribe({
      next: response => {
        // Mise à jour du statut d'anonymat basé sur la réponse du serveur
        if (this.profileData.professional) {
          this.profileData.professional.is_anonymous = response.is_anonymous;
        }

        this.successMessage = response.message || 'Mode anonyme mis à jour avec succès';
        this.loading = false;
      },
      error: err => {
        console.error('Erreur lors de la mise à jour du mode anonyme:', err);
        this.errorMessage = 'Impossible de mettre à jour le mode anonyme.';
        this.loading = false;
      },
    });
  }

  // Méthode pour vérifier si l'utilisateur est un professionnel
  isProfessional(): boolean {
    return this.profileData?.role?.name === 'ROLE_PRO';
  }

  // Méthode pour vérifier si l'utilisateur est un patient
  isPatient(): boolean {
    return this.profileData?.role?.name === 'ROLE_PATIENT';
  }

  // Afficher/masquer les modales de formulaire
  showForm(formType: 'profile' | 'password'): void {
    this.hideAllForms();
    this.successMessage = null;
    this.errorMessage = null;

    switch (formType) {
      case 'profile':
        this.showProfileForm = true;
        break;
      case 'password':
        this.showPasswordForm = true;
        break;
    }
  }

  hideAllForms(): void {
    this.showProfileForm = false;
    this.showPasswordForm = false;
  }

  // Gestionnaires d'événements pour les formulaires
  onProfileSaved(data: any): void {
    this.successMessage = 'Profil mis à jour avec succès';
    this.hideAllForms();
    this.loadProfileData();
  }

  onPasswordChanged(): void {
    this.successMessage = 'Mot de passe modifié avec succès';
    this.hideAllForms();
  }

  onFormCancelled(): void {
    this.hideAllForms();
  }

  onFormError(error: string): void {
    this.errorMessage = error;
  }

  // Méthode pour se reconnecter
  reconnect(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
