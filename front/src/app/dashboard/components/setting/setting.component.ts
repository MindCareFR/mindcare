import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { ProfileService } from '@services/profile.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setting.component.html'
})
export class SettingsComponent implements OnInit, OnDestroy {
  deleteAccountForm!: FormGroup;
  isSubmitting = false;
  submissionSuccess = false;
  submissionError = false;
  errorMessage = '';
  successMessage = '';
  isDarkMode = false;
  isProfileVisible = true;
  isPatient = false; // Nouvelle propriété pour vérifier si l'utilisateur est un patient

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.initForms();

    // CORRECTION : Accès à la propriété sans ()
    this.isDarkMode = this.themeService.isDarkMode;

    // Abonnement aux changements de thème
    this.themeService.darkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });

    this.loadProfileVisibility();
  }

  loadProfileVisibility() {
    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe(userData => {
        if (userData) {
          // Détermine si l'utilisateur est un patient
          this.isPatient = !!userData.patient;

          if (userData.patient?.is_anonymous !== undefined) {
            this.isProfileVisible = !userData.patient.is_anonymous;
          } else if (userData.professional?.is_anonymous !== undefined) {
            this.isProfileVisible = !userData.professional.is_anonymous;
          }
        }
      });
  }

  toggleProfileVisibility() {
    // Vérifie si l'utilisateur est un patient avant de permettre la modification
    if (!this.isPatient) {
      this.errorMessage = 'Seuls les patients peuvent modifier la visibilité du profil.';
      this.submissionError = true;
      return;
    }

    this.isProfileVisible = !this.isProfileVisible;

    this.profileService.toggleAnonymousMode()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.is_anonymous !== undefined) {
            this.isProfileVisible = !response.is_anonymous;
          }
          this.successMessage = this.isProfileVisible
            ? 'Votre profil est désormais visible par les autres utilisateurs.'
            : 'Votre profil est désormais invisible aux autres utilisateurs.';
          this.submissionSuccess = true;
          this.submissionError = false;

          setTimeout(() => {
            this.submissionSuccess = false;
          }, 3000);
        },
        error: (error) => {
          this.isProfileVisible = !this.isProfileVisible;
          this.errorMessage = error.message || 'Une erreur est survenue lors du changement de visibilité.';
          this.submissionError = true;
          this.submissionSuccess = false;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForms() {
    this.deleteAccountForm = this.fb.group({
      password: ['', [Validators.required]],
      confirmation: [false, [Validators.requiredTrue]]
    });
  }

  onDeleteAccount() {
    if (this.deleteAccountForm.invalid) {
      this.deleteAccountForm.markAllAsTouched();
      return;
    }

    if (!confirm('Êtes-vous certain de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return;
    }

    this.isSubmitting = true;
    this.submissionError = false;

    this.profileService.deleteAccount(this.deleteAccountForm.value.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.authService.logout();
          this.router.navigate(['/auth/login'], {
            queryParams: { message: 'Votre compte a été supprimé avec succès.' }
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submissionError = true;
          this.errorMessage = error.message || 'Une erreur est survenue lors de la suppression du compte.';
        }
      });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
