import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PasswordChangeRequest, ProfileService } from '@services/profile.service';
import { ThemeService } from '@services/theme.service';

enum UserRole {
  PROFESSIONAL = 'ROLE_PRO',
  PATIENT = 'ROLE_PATIENT',
}

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
  avatar?: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  templateUrl: './user-profile.component.html',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
})
export class UserProfileComponent implements OnInit {
  profileData: ProfileData = {
    firstname: '',
    lastname: '',
    email: '',
    role: { name: 'ROLE_PATIENT' },
    avatar: '/avatar.png',
  };

  loading = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  loadFailed = false;

  showEditModal = false;
  activeEditSection:
    | 'name'
    | 'contact'
    | 'address'
    | 'profile'
    | 'professional'
    | 'avatar'
    | 'personal-info' = 'profile';
  editForm: FormGroup;
  isSubmitting = false;

  showPasswordModal = false;
  passwordForm: FormGroup;
  isPasswordSubmitting = false;
  isDarkMode = false;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private fb: FormBuilder,
    private themeService: ThemeService
  ) {
    this.editForm = this.fb.group({});
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator() }
    );
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newPassword = control.get('newPassword');
      const confirmPassword = control.get('confirmPassword');
      return newPassword && confirmPassword && newPassword.value !== confirmPassword.value
        ? { notSame: true }
        : null;
    };
  }

  ngOnInit(): void {
    this.loadProfileData();

    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  loadProfileData(): void {
    this.loading = true;
    const token = localStorage.getItem('token');
    if (!token) {
      this.handleAuthError();
      return;
    }

    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.profileData = data;

        // Correction pour récupérer correctement la date de naissance
        if (this.isPatient() && this.profileData.patient?.birthdate) {
          this.profileData.birthdate = this.profileData.patient.birthdate;
        }

        // S'assurer que la date est au format YYYY-MM-DD pour les inputs de type date
        if (this.profileData.birthdate) {
          const date = new Date(this.profileData.birthdate);
          if (!isNaN(date.getTime())) {
            this.profileData.birthdate = date.toISOString().split('T')[0];
          }
        }

        this.loading = false;
      },
      error: (err: any) => this.handleProfileError(err),
    });
  }

  // Méthode pour récupérer la date de naissance correcte, quelle que soit la source
  getBirthdate(): string | undefined {
    // Pour les patients, privilégier la date dans patient.birthdate
    if (this.isPatient() && this.profileData.patient?.birthdate) {
      const date = new Date(this.profileData.patient.birthdate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // Format YYYY-MM-DD pour l'input date
      }
    }

    // Sinon utiliser la date générale du profil
    if (this.profileData.birthdate) {
      const date = new Date(this.profileData.birthdate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }

    return undefined;
  }

  getInitials(): string {
    const firstname = this.profileData?.firstname || 'U';
    const lastname = this.profileData?.lastname || '';
    return firstname.charAt(0).toUpperCase() + (lastname.charAt(0).toUpperCase() || '');
  }

  getRoleLabel(): string {
    switch (this.profileData?.role?.name) {
      case UserRole.PROFESSIONAL:
        return 'Professionnel de santé';
      case UserRole.PATIENT:
        return 'Patient';
      default:
        return 'Utilisateur';
    }
  }

  isProfessional(): boolean {
    return this.profileData?.role?.name === UserRole.PROFESSIONAL;
  }

  isPatient(): boolean {
    return this.profileData?.role?.name === UserRole.PATIENT;
  }

  openEditModal(section: typeof this.activeEditSection): void {
    this.activeEditSection = section;
    this.showEditModal = true;
    this.initEditForm(section);
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editForm.reset();
  }

  initEditForm(section: string): void {
    // Récupérer la date de naissance avec la méthode helper
    const birthdate = this.getBirthdate();

    switch (section) {
      case 'name':
        this.editForm = this.fb.group({
          firstname: [this.profileData.firstname, [Validators.required, Validators.minLength(2)]],
          lastname: [this.profileData.lastname, [Validators.required, Validators.minLength(2)]],
        });
        break;

      case 'contact':
        this.editForm = this.fb.group({
          email: [this.profileData.email, [Validators.required, Validators.email]],
          phone: [this.profileData.phone, [Validators.pattern(/^[0-9+\s()-]*$/)]],
        });
        break;

      case 'address':
        this.editForm = this.fb.group({
          address: [this.profileData.address],
          address_complement: [this.profileData.address_complement],
          zipcode: [this.profileData.zipcode, [Validators.pattern(/^[0-9]{5}$/)]],
          city: [this.profileData.city],
          country: [this.profileData.country || 'France'],
        });
        break;

      case 'profile':
        this.editForm = this.fb.group({
          firstname: [this.profileData.firstname, [Validators.required, Validators.minLength(2)]],
          lastname: [this.profileData.lastname, [Validators.required, Validators.minLength(2)]],
          email: [this.profileData.email, [Validators.required, Validators.email]],
          phone: [this.profileData.phone, [Validators.pattern(/^[0-9+\s()-]*$/)]],
          birthdate: [birthdate], // Utiliser la date récupérée par la méthode helper
        });
        break;

      case 'professional':
        // Transformer le tableau de langues en chaîne de caractères pour l'édition
        const languagesString = this.profileData.professional?.languages
          ? this.profileData.professional.languages.join(', ')
          : '';

        // Transformer le tableau des spécialités en chaîne de caractères pour l'édition
        const specialtiesString = this.profileData.professional?.specialties
          ? this.profileData.professional.specialties.join(', ')
          : '';

        this.editForm = this.fb.group({
          company_name: [this.profileData.professional?.company_name, Validators.required],
          medical_identification_number: [
            this.profileData.professional?.medical_identification_number,
          ],
          company_identification_number: [
            this.profileData.professional?.company_identification_number,
          ],
          experience: [
            this.profileData.professional?.experience || 0,
            [Validators.min(0), Validators.max(50)],
          ],
          certification: [this.profileData.professional?.certification],
          biography: [this.profileData.professional?.biography, Validators.maxLength(500)],
          languages: [languagesString],
          specialties: [specialtiesString],
        });
        break;

      case 'personal-info':
        this.editForm = this.fb.group({
          firstname: [this.profileData.firstname, [Validators.required, Validators.minLength(2)]],
          lastname: [this.profileData.lastname, [Validators.required, Validators.minLength(2)]],
          birthdate: [birthdate], // Utiliser la date récupérée par la méthode helper
        });
        break;

      default:
        this.editForm = this.fb.group({});
        break;
    }
  }

  submitEditForm(): void {
    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const updateData = { ...this.editForm.value };

    // Traitement des langues et spécialités pour le profil professionnel
    if (this.activeEditSection === 'professional') {
      // Création d'un nouvel objet pour les données professionnelles
      // Pour éviter d'envoyer des propriétés undefined ou null qui peuvent causer l'erreur 422
      const professionalData: any = {
        company_name: updateData.company_name || '',
        experience: updateData.experience || 0,
      };

      // Ajouter uniquement les champs non vides
      if (updateData.medical_identification_number) {
        professionalData.medical_identification_number = updateData.medical_identification_number;
      }

      if (updateData.company_identification_number) {
        professionalData.company_identification_number = updateData.company_identification_number;
      }

      if (updateData.certification) {
        professionalData.certification = updateData.certification;
      }

      if (updateData.biography) {
        professionalData.biography = updateData.biography;
      }

      // Convertir la chaîne de caractères en tableau de langues si elle existe
      if (updateData.languages) {
        professionalData.languages = updateData.languages
          .split(',')
          .map((lang: string) => lang.trim())
          .filter((lang: string) => lang.length > 0);
      } else {
        professionalData.languages = ['Français']; // Valeur par défaut
      }

      // Convertir la chaîne de caractères en tableau de spécialités si elle existe
      if (updateData.specialties) {
        professionalData.specialties = updateData.specialties
          .split(',')
          .map((specialty: string) => specialty.trim())
          .filter((specialty: string) => specialty.length > 0);
      } else {
        professionalData.specialties = []; // Valeur par défaut
      }

      // Remplacer les données du formulaire par l'objet nettoyé
      this.updateProfessionalInfo(professionalData);
      return;
    }

    // Traitement spécifique pour les mises à jour de date de naissance selon le rôle
    if (
      (this.activeEditSection === 'profile' || this.activeEditSection === 'personal-info') &&
      this.isPatient() &&
      updateData.birthdate
    ) {
      // Si c'est un patient, mettre à jour la date dans patient.birthdate également
      updateData.patient = { birthdate: updateData.birthdate };
    }

    // Pour les autres types de formulaires
    this.updateBasicInfo(updateData);
  }

  updateBasicInfo(data: any): void {
    this.profileService.updateBasicInfo(data).subscribe({
      next: response => this.handleUpdateSuccess(response),
      error: error => this.handleUpdateError(error),
    });
  }

  updateProfessionalInfo(data: any): void {
    this.profileService.updateProfessionalProfile(data).subscribe({
      next: response => this.handleUpdateSuccess(response),
      error: error => this.handleUpdateError(error),
    });
  }

  private handleUpdateSuccess(response: any): void {
    this.isSubmitting = false;
    this.successMessage = 'Informations mises à jour avec succès';
    this.closeEditModal();
    this.loadProfileData();
    setTimeout(() => (this.successMessage = null), 3000);
  }

  private handleUpdateError(error: any): void {
    this.isSubmitting = false;
    if (error?.status === 401) {
      this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } else if (error?.status === 422) {
      this.errorMessage =
        'Format des données invalide. Veuillez vérifier les informations saisies.';
      console.error('Erreur 422 :', error);
    } else {
      this.errorMessage = 'Erreur lors de la mise à jour. Veuillez réessayer.';
    }
    setTimeout(() => (this.errorMessage = null), 4000);
  }

  getModalTitle(): string {
    switch (this.activeEditSection) {
      case 'name':
        return 'Modifier votre nom';
      case 'contact':
        return 'Modifier vos coordonnées';
      case 'address':
        return 'Modifier votre adresse';
      case 'profile':
        return 'Modifier votre profil';
      case 'professional':
        return 'Modifier vos informations professionnelles';
      case 'avatar':
        return 'Modifier votre avatar';
      case 'personal-info':
        return 'Modifier vos informations personnelles';
      default:
        return 'Modifier vos informations';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Non spécifiée';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  }

  isProfileAnonymous(): boolean {
    if (this.isProfessional() && this.profileData.professional) {
      return !!this.profileData.professional.is_anonymous;
    } else if (this.isPatient() && this.profileData.patient) {
      return !!this.profileData.patient.is_anonymous;
    }
    return false;
  }

  toggleProfileVisibility(): void {
    // Ne permettre qu'aux patients de modifier leur visibilité
    if (!this.isPatient()) {
      this.errorMessage = 'Seuls les patients peuvent modifier la visibilité du profil.';
      setTimeout(() => (this.errorMessage = null), 3000);
      return;
    }

    this.profileService.toggleAnonymousMode().subscribe({
      next: () => {
        if (this.isProfessional() && this.profileData.professional) {
          this.profileData.professional.is_anonymous = !this.profileData.professional.is_anonymous;
        } else if (this.isPatient() && this.profileData.patient) {
          this.profileData.patient.is_anonymous = !this.profileData.patient.is_anonymous;
        }
        this.successMessage = this.isProfileAnonymous()
          ? 'Profil rendu anonyme'
          : 'Profil rendu visible';
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: error => {
        this.errorMessage = 'Erreur de changement de visibilité';
        console.error(error);
        setTimeout(() => (this.errorMessage = null), 3000);
      },
    });
  }

  openPasswordModal(): void {
    this.passwordForm.reset();
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
  }

  submitPasswordForm(): void {
    if (this.passwordForm.invalid) return;

    this.isPasswordSubmitting = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    const requestData: PasswordChangeRequest = {
      current_password: currentPassword,
      new_password: newPassword,
    };

    this.profileService.changePassword(requestData).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe modifié avec succès';
        this.closePasswordModal();
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: error => {
        this.errorMessage = 'Erreur lors du changement de mot de passe';
        console.error(error);
        setTimeout(() => (this.errorMessage = null), 3000);
      },
      complete: () => (this.isPasswordSubmitting = false),
    });
  }

  private handleAuthError(): void {
    this.errorMessage = 'Veuillez vous connecter pour accéder à votre profil';
    this.loading = false;
    this.loadFailed = true;
    setTimeout(() => this.router.navigate(['/login']), 2000);
  }

  private handleProfileError(err: any): void {
    console.error('Erreur de chargement du profil:', err);
    this.errorMessage = 'Impossible de charger les données du profil';
    this.loadFailed = true;
    this.loading = false;

    if (err?.status === 401) {
      localStorage.removeItem('token');
      setTimeout(() => this.router.navigate(['/login']), 2000);
    }
  }
}
