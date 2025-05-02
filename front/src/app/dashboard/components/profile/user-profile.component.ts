// Dans user-profile.component.ts, ajoutons les fonctionnalités de mode sombre

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PasswordChangeRequest, ProfileService } from '@services/profile.service';
import { ThemeService } from '@services/theme.service'; // Importons le service de thème

enum UserRole {
  PROFESSIONAL = 'ROLE_PRO',
  PATIENT = 'ROLE_PATIENT'
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
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class UserProfileComponent implements OnInit {
  profileData: ProfileData = {
    firstname: '',
    lastname: '',
    email: '',
    role: { name: 'ROLE_PATIENT' },
    avatar: '/avatar.png'
  };

  loading = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  loadFailed = false;

  showEditModal = false;
  activeEditSection: 'name' | 'contact' | 'address' | 'profile' | 'professional' | 'avatar' | 'personal-info' = 'profile';
  editForm: FormGroup;
  isSubmitting = false;

  showPasswordModal = false;
  passwordForm: FormGroup;
  isPasswordSubmitting = false;
  isDarkMode = false; // Ajout de la propriété pour le mode sombre

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private fb: FormBuilder,
    private themeService: ThemeService // Injection du service de thème
  ) {
    this.editForm = this.fb.group({});
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator() });
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

    // S'abonner au changement de thème
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
        this.loading = false;
      },
      error: (err: any) => this.handleProfileError(err)
    });
  }

  getInitials(): string {
    const firstname = this.profileData?.firstname || 'U';
    const lastname = this.profileData?.lastname || '';
    return firstname.charAt(0).toUpperCase() + (lastname.charAt(0).toUpperCase() || '');
  }

  getRoleLabel(): string {
    switch(this.profileData?.role?.name) {
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
    switch (section) {
      case 'name':
        this.editForm = this.fb.group({
          firstname: [this.profileData.firstname, [Validators.required, Validators.minLength(2)]],
          lastname: [this.profileData.lastname, [Validators.required, Validators.minLength(2)]]
        });
        break;

      case 'contact':
        this.editForm = this.fb.group({
          email: [this.profileData.email, [Validators.required, Validators.email]],
          phone: [this.profileData.phone, [Validators.pattern(/^[0-9+\s()-]*$/)]]
        });
        break;

      case 'address':
        this.editForm = this.fb.group({
          address: [this.profileData.address],
          address_complement: [this.profileData.address_complement],
          zipcode: [this.profileData.zipcode, [Validators.pattern(/^[0-9]{5}$/)]],
          city: [this.profileData.city],
          country: [this.profileData.country || 'France']
        });
        break;

      case 'profile':
        this.editForm = this.fb.group({
          firstname: [this.profileData.firstname, [Validators.required, Validators.minLength(2)]],
          lastname: [this.profileData.lastname, [Validators.required, Validators.minLength(2)]],
          email: [this.profileData.email, [Validators.required, Validators.email]],
          phone: [this.profileData.phone, [Validators.pattern(/^[0-9+\s()-]*$/)]],
          birthdate: [this.profileData.birthdate]
        });
        break;

      case 'professional':
        this.editForm = this.fb.group({
          company_name: [this.profileData.professional?.company_name, Validators.required],
          experience: [this.profileData.professional?.experience || 0, [Validators.min(0), Validators.max(50)]],
          certification: [this.profileData.professional?.certification],
          biography: [this.profileData.professional?.biography, Validators.maxLength(500)]
        });
        break;

      case 'personal-info':
        this.editForm = this.fb.group({
          firstname: [this.profileData.firstname, [Validators.required, Validators.minLength(2)]],
          lastname: [this.profileData.lastname, [Validators.required, Validators.minLength(2)]],
          birthdate: [this.profileData.birthdate]
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
    const updateData = this.editForm.value;

    switch (this.activeEditSection) {
      case 'professional':
        this.updateProfessionalInfo(updateData);
        break;
      default:
        this.updateBasicInfo(updateData);
        break;
    }
  }

  updateBasicInfo(data: any): void {
    this.profileService.updateBasicInfo(data).subscribe({
      next: (response) => this.handleUpdateSuccess(response),
      error: (error) => this.handleUpdateError(error)
    });
  }

  updateProfessionalInfo(data: any): void {
    this.profileService.updateProfessionalProfile(data).subscribe({
      next: (response) => this.handleUpdateSuccess(response),
      error: (error) => this.handleUpdateError(error)
    });
  }

  private handleUpdateSuccess(response: any): void {
    this.isSubmitting = false;
    this.successMessage = 'Informations mises à jour avec succès';
    this.closeEditModal();
    this.loadProfileData();
    setTimeout(() => this.successMessage = null, 3000);
  }

  private handleUpdateError(error: any): void {
    this.isSubmitting = false;
    if (error?.status === 401) {
      this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } else {
      this.errorMessage = 'Erreur lors de la mise à jour. Veuillez réessayer.';
    }
    setTimeout(() => this.errorMessage = null, 4000);
  }

  getModalTitle(): string {
    switch (this.activeEditSection) {
      case 'name': return 'Modifier votre nom';
      case 'contact': return 'Modifier vos coordonnées';
      case 'address': return 'Modifier votre adresse';
      case 'profile': return 'Modifier votre profil';
      case 'professional': return 'Modifier vos informations professionnelles';
      case 'avatar': return 'Modifier votre avatar';
      case 'personal-info': return 'Modifier vos informations personnelles';
      default: return 'Modifier vos informations';
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
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur de changement de visibilité';
        console.error(error);
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }

  openPasswordModal(): void {
    // Correction: Réinitialiser et définir les valeurs par défaut du formulaire
    this.passwordForm.reset();
    this.showPasswordModal = true; // Correction: Placer après le reset
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
      new_password: newPassword
    };

    this.profileService.changePassword(requestData).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe modifié avec succès';
        this.closePasswordModal();
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du changement de mot de passe';
        console.error(error);
        setTimeout(() => this.errorMessage = null, 3000);
      },
      complete: () => this.isPasswordSubmitting = false
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
