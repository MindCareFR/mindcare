import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '@services/profile.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  templateUrl: './user-profile.component.html',
  imports: [
    CommonModule,
    FormsModule,
  ]
})
export class UserProfileComponent implements OnInit {
  // Avatar par défaut
  @Input() userAvatar: string = '/assets/images/default-avatar.jpg';

  // Section active (non utilisé dans la nouvelle version)
  activeSection: string = 'personal';

  // Variables supplémentaires pour les champs spéciaux
  languagesInput: string = '';
  specialtiesInput: string = '';

  // Données du profil
  profileData: any = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    address_complement: '',
    zipcode: '',
    city: '',
    country: '',
    avatar: '',
    role: '',
    professional: null,
    patient: null
  };

  originalProfileData: any = {};
  loading = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private profileService: ProfileService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.initializeEmptyObjects();
    this.loadProfileData();
  }

  // Méthode pour obtenir les initiales pour l'avatar de secours
  getInitials(): string {
    const firstname = this.profileData?.firstname || '';
    const lastname = this.profileData?.lastname || '';

    const firstInitial = firstname.charAt(0).toUpperCase();
    const lastInitial = lastname.charAt(0).toUpperCase();

    return firstInitial + lastInitial || 'U';
  }

  // Méthode pour vérifier si l'utilisateur est un professionnel
  isProfessional(): boolean {
    return this.profileData?.role === 'ROLE_PRO' ||
      (this.profileData?.professional && !this.profileData?.patient);
  }

  // Méthode pour vérifier si l'utilisateur est un patient
  isPatient(): boolean {
    return this.profileData?.role === 'ROLE_PATIENT' ||
      (this.profileData?.patient && !this.profileData?.professional);
  }

  // Méthode pour obtenir le libellé du rôle
  getUserRoleLabel(): string {
    if (this.isProfessional()) {
      return 'Professionnel de santé';
    } else if (this.isPatient()) {
      return 'Patient';
    }
    return 'Utilisateur';
  }

  // Méthode pour initialiser les objets vides
  initializeEmptyObjects(): void {
    if (!this.profileData.patient) {
      this.profileData.patient = {
        gender: '',
        birthdate: null,
        is_anonymous: false
      };
    }
    if (!this.profileData.professional) {
      this.profileData.professional = {
        company_name: '',
        medical_identification_number: '',
        biography: '',
        experience: 0,
        certification: '',
        languages: [],
        specialties: [],
        availability_hours: {}
      };
    }
  }

  loadProfileData(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (data) => {
        if (!data) {
          this.loading = false;
          this.errorMessage = 'Impossible de charger les données du profil.';
          return;
        }
        this.profileData = {
          ...data,
          professional: data.professional || null,
          patient: data.patient || null,
          role: data.role || ''
        };

        // Si l'API ne renvoie pas d'avatar, on utilise celui par défaut
        if (!this.profileData.avatar) {
          this.profileData.avatar = this.userAvatar;
        }

        // Initialisation des champs spéciaux
        if (this.profileData.professional) {
          this.languagesInput = this.profileData.professional.languages?.join(', ') || '';
          this.specialtiesInput = this.profileData.professional.specialties?.join(', ') || '';
        }

        this.initializeEmptyObjects();
        this.originalProfileData = JSON.parse(JSON.stringify(this.profileData));
        this.originalProfileData.languagesInput = this.languagesInput;
        this.originalProfileData.specialtiesInput = this.specialtiesInput;

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile data:', err);
        this.errorMessage = 'Impossible de charger les données du profil.';
        this.loading = false;
      }
    });
  }

  saveProfile(): void {
    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;

    // Conversion des champs spéciaux avant sauvegarde
    if (this.isProfessional() && this.profileData.professional) {
      this.profileData.professional.languages = this.languagesInput
        .split(',')
        .map(lang => lang.trim())
        .filter(lang => lang);

      this.profileData.professional.specialties = this.specialtiesInput
        .split(',')
        .map(spec => spec.trim())
        .filter(spec => spec);
    }

    const basicData = {
      firstname: this.profileData.firstname,
      lastname: this.profileData.lastname,
      phone: this.profileData.phone,
      address: this.profileData.address,
      address_complement: this.profileData.address_complement,
      zipcode: this.profileData.zipcode,
      city: this.profileData.city,
      country: this.profileData.country
    };

    this.profileService.updateBasicInfo(basicData).subscribe({
      next: () => {
        if (this.isProfessional() && this.profileData.professional) {
          this.updateProfessionalProfile();
        } else if (this.isPatient() && this.profileData.patient) {
          this.updatePatientProfile();
        } else {
          this.loading = false;
          this.successMessage = 'Profil mis à jour avec succès';
          this.originalProfileData = JSON.parse(JSON.stringify(this.profileData));
          this.originalProfileData.languagesInput = this.languagesInput;
          this.originalProfileData.specialtiesInput = this.specialtiesInput;
          setTimeout(() => this.successMessage = null, 3000);
        }
      },
      error: (err) => {
        console.error('Error updating basic info:', err);
        this.errorMessage = 'Erreur lors de la mise à jour du profil';
        this.loading = false;
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }

  updateProfessionalProfile(): void {
    const professionalData = {
      company_name: this.profileData.professional.company_name,
      medical_identification_number: this.profileData.professional.medical_identification_number,
      biography: this.profileData.professional.biography,
      experience: this.profileData.professional.experience ? parseInt(this.profileData.professional.experience.toString()) : 0,
      certification: this.profileData.professional.certification,
      languages: this.profileData.professional.languages || [],
      specialties: this.profileData.professional.specialties || [],
      availability_hours: this.profileData.professional.availability_hours || {}
    };

    this.profileService.updateProfessionalProfile(professionalData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Profil professionnel mis à jour avec succès';
        this.originalProfileData = JSON.parse(JSON.stringify(this.profileData));
        this.originalProfileData.languagesInput = this.languagesInput;
        this.originalProfileData.specialtiesInput = this.specialtiesInput;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error updating professional profile:', err);
        this.errorMessage = 'Erreur lors de la mise à jour du profil professionnel';
        this.loading = false;
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }

  updatePatientProfile(): void {
    const patientData = {
      gender: this.profileData.patient.gender,
      is_anonymous: this.profileData.patient.is_anonymous || false,
      birthdate: this.profileData.patient.birthdate
    };

    this.profileService.updatePatientProfile(patientData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Profil patient mis à jour avec succès';this.originalProfileData = JSON.parse(JSON.stringify(this.profileData));
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Error updating patient profile:', err);
        this.errorMessage = 'Erreur lors de la mise à jour du profil patient';
        this.loading = false;
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }

  resetForm(): void {
    // Restaurer les données originales
    this.profileData = JSON.parse(JSON.stringify(this.originalProfileData));

    // Restaurer les champs spéciaux
    if (this.isProfessional()) {
      this.languagesInput = this.originalProfileData.languagesInput || '';
      this.specialtiesInput = this.originalProfileData.specialtiesInput || '';
    }

    this.successMessage = 'Modifications annulées';
    setTimeout(() => this.successMessage = null, 3000);
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Pour le moment, affichons simplement un message
      this.successMessage = 'Fonctionnalité de changement de photo non implémentée';
      setTimeout(() => this.successMessage = null, 3000);

      // Une implémentation complète impliquerait :
      // 1. Vérification du type/taille de fichier
      // 2. Prévisualisation de l'image
      // 3. Upload vers le serveur
      // 4. Mise à jour du profileData.avatar avec l'URL retournée
    }
  }
}
