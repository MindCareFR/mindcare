import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '@services/profile.service';
import { ProfileData } from '../user-profile.component';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-form.component.html',
})
export class ProfileFormComponent implements OnInit {
  @Input() profileData!: ProfileData;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() formError = new EventEmitter<string>();

  // Copie éditable
  editableProfile: any = {
    basic: {},
    professional: {},
    patient: {},
  };

  // Variables pour les listes dynamiques
  newLanguage = '';
  newSpecialty = '';

  // États
  loading = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    console.log('Initialisation du formulaire de profil');
    console.log('ProfileData:', this.profileData);
    if (this.profileData.professional) {
      console.log('Langues reçues:', this.profileData.professional.languages);
    }

    // Créer une copie des données pour l'édition
    this.resetForm();
  }

  resetForm(): void {
    // Informations de base
    this.editableProfile.basic = {
      firstname: this.profileData.firstname || '',
      lastname: this.profileData.lastname || '',
      email: this.profileData.email || '',
      phone: this.profileData.phone || '',
      address: this.profileData.address || '',
      address_complement: this.profileData.address_complement || '',
      zipcode: this.profileData.zipcode || '',
      city: this.profileData.city || '',
      country: this.profileData.country || '',
      birthdate: this.profileData.birthdate || '',
    };

    // Informations professionnelles (si applicable)
    if (this.isProfessional() && this.profileData.professional) {
      // Créer une copie profonde des données du professionnel
      const professionalData = JSON.parse(JSON.stringify(this.profileData.professional));

      // S'assurer que les tableaux sont correctement initialisés
      const languages = Array.isArray(professionalData.languages)
        ? [...professionalData.languages]
        : ['Français'];

      const specialties = Array.isArray(professionalData.specialties)
        ? [...professionalData.specialties]
        : [];

      this.editableProfile.professional = {
        company_name: professionalData.company_name || '',
        medical_identification_number: professionalData.medical_identification_number || '',
        company_identification_number: professionalData.company_identification_number || '',
        biography: professionalData.biography || '',
        experience: professionalData.experience || 0,
        certification: professionalData.certification || '',
        languages: languages,
        specialties: specialties,
        is_anonymous: professionalData.is_anonymous || false,
      };

      console.log('Profil professionnel initialisé:', this.editableProfile.professional);
      console.log('Langues après initialisation:', this.editableProfile.professional.languages);
    }

    // Informations patient (si applicable)
    if (this.isPatient() && this.profileData.patient) {
      this.editableProfile.patient = {
        gender: this.profileData.patient.gender || '',
        birthdate: this.profileData.patient.birthdate || '',
        is_anonymous: this.profileData.patient.is_anonymous || false,
      };
    }
  }

  // Méthodes pour vérifier le type d'utilisateur
  isProfessional(): boolean {
    return this.profileData?.role?.name === 'ROLE_PRO';
  }

  isPatient(): boolean {
    return this.profileData?.role?.name === 'ROLE_PATIENT';
  }

  // Méthodes pour gérer les langues
  addLanguage(): void {
    if (!this.newLanguage.trim()) return;

    if (!Array.isArray(this.editableProfile.professional.languages)) {
      this.editableProfile.professional.languages = [];
    }

    if (!this.editableProfile.professional.languages.includes(this.newLanguage)) {
      this.editableProfile.professional.languages.push(this.newLanguage);
      console.log('Langue ajoutée:', this.newLanguage);
    }
    this.newLanguage = '';
  }

  removeLanguage(language: string): void {
    if (!Array.isArray(this.editableProfile.professional.languages)) return;

    const index = this.editableProfile.professional.languages.indexOf(language);
    if (index !== -1) {
      this.editableProfile.professional.languages.splice(index, 1);
      console.log('Langue supprimée:', language);
    }
  }

  // Méthodes pour gérer les spécialités
  addSpecialty(): void {
    if (!this.newSpecialty.trim()) return;

    if (!Array.isArray(this.editableProfile.professional.specialties)) {
      this.editableProfile.professional.specialties = [];
    }

    if (!this.editableProfile.professional.specialties.includes(this.newSpecialty)) {
      this.editableProfile.professional.specialties.push(this.newSpecialty);
      console.log('Spécialité ajoutée:', this.newSpecialty);
    }
    this.newSpecialty = '';
  }

  removeSpecialty(specialty: string): void {
    if (!Array.isArray(this.editableProfile.professional.specialties)) return;

    const index = this.editableProfile.professional.specialties.indexOf(specialty);
    if (index !== -1) {
      this.editableProfile.professional.specialties.splice(index, 1);
      console.log('Spécialité supprimée:', specialty);
    }
  }

  saveChanges(): void {
    this.loading = true;
    console.log('Données à envoyer:', this.editableProfile);

    // Envoi des informations de base
    this.profileService.updateBasicInfo(this.editableProfile.basic).subscribe({
      next: basicResponse => {
        console.log('Informations de base mises à jour:', basicResponse);

        // Si professionnel, mettre à jour les informations professionnelles
        if (this.isProfessional()) {
          this.profileService
            .updateProfessionalProfile(this.editableProfile.professional)
            .subscribe({
              next: proResponse => {
                console.log('Informations professionnelles mises à jour:', proResponse);
                this.loading = false;
                this.formSubmitted.emit({
                  basic: basicResponse,
                  professional: proResponse,
                });
              },
              error: err => {
                console.error('Erreur lors de la mise à jour professionnelle:', err);
                this.loading = false;
                this.formError.emit(
                  'Impossible de mettre à jour les informations professionnelles'
                );
              },
            });
        } else {
          this.loading = false;
          this.formSubmitted.emit({ basic: basicResponse });
        }
      },
      error: err => {
        console.error('Erreur lors de la mise à jour de base:', err);
        this.loading = false;
        this.formError.emit('Impossible de mettre à jour les informations de base');
      },
    });
  }

  cancel(): void {
    this.formCancelled.emit();
  }
}
