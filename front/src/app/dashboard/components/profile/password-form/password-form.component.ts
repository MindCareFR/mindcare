import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '@services/profile.service';

@Component({
  selector: 'app-password-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-form.component.html'
})
export class PasswordFormComponent {
  @Output() passwordChanged = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() formError = new EventEmitter<string>();

  passwordData = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  loading = false;

  validationErrors = {
    current_password: '',
    new_password: '',
    confirm_password: '',
    match: ''
  };

  constructor(private profileService: ProfileService) {}

  changePassword(): void {
    this.resetValidationErrors();

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    this.profileService.changePassword({
      current_password: this.passwordData.current_password,
      new_password: this.passwordData.new_password
    }).subscribe({
      next: (response) => {
        console.log('Mot de passe changé avec succès', response);
        this.loading = false;
        this.passwordChanged.emit();
      },
      error: (err) => {
        console.error('Erreur de changement de mot de passe:', err);
        this.loading = false;

        if (err.status === 422 && err.error?.errors?.current_password) {
          this.formError.emit('Mot de passe actuel incorrect');
        } else {
          this.formError.emit('Impossible de changer le mot de passe');
        }
      }
    });
  }

  // Ajout de la méthode cancel
  cancel(): void {
    this.formCancelled.emit();
  }

  validateForm(): boolean {
    let isValid = true;

    if (!this.passwordData.current_password) {
      this.validationErrors.current_password = 'Veuillez entrer votre mot de passe actuel';
      isValid = false;
    }

    if (!this.passwordData.new_password) {
      this.validationErrors.new_password = 'Veuillez entrer un nouveau mot de passe';
      isValid = false;
    } else if (this.passwordData.new_password.length < 8) {
      this.validationErrors.new_password = 'Le mot de passe doit comporter au moins 8 caractères';
      isValid = false;
    }

    if (!this.passwordData.confirm_password) {
      this.validationErrors.confirm_password = 'Veuillez confirmer votre nouveau mot de passe';
      isValid = false;
    }

    if (this.passwordData.new_password !== this.passwordData.confirm_password) {
      this.validationErrors.match = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    return isValid;
  }

  resetValidationErrors(): void {
    this.validationErrors = {
      current_password: '',
      new_password: '',
      confirm_password: '',
      match: ''
    };
  }
}
