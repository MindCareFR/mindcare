import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { FooterComponent } from '@components/footer/footer.component';
import { FormComponent } from '@shared/form/form.component';
import { IFormConfig, IFormField, IFormGroup } from '@interfaces/form.interface';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import type { ValidatorFn } from '@interfaces/form.interface';

@Component({
  selector: 'app-auth-signup',
  standalone: true,
  templateUrl: './auth-signup.component.html',
  imports: [CommonModule, NavbarComponent, FooterComponent, FormComponent, ReactiveFormsModule],
})
export class AuthSignupComponent implements OnInit {
  appName = 'MindCare';

  signupConfig: Record<string, IFormConfig> = {
    user: {
      fields: [
        {
          group: 'identity',
          label: 'Identité',
          description:
            "Nous ne divulguerons jamais vos informations personnelles à des tiers. Vous avez la possibilité à tout moment d'apparaître en mode privé.",
          fields: [
            {
              name: 'gender',
              type: 'select',
              label: 'Civilité',
              placeholder: 'Sélectionnez votre civilité',
              options: ['Monsieur', 'Madame', 'Autre'],
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'firstname',
              type: 'text',
              label: 'Prénom',
              placeholder: 'Entrez votre prénom',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'lastname',
              type: 'text',
              label: 'Nom de famille',
              placeholder: 'Entrez votre nom de famille',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'email',
              type: 'email',
              label: 'Adresse e-mail',
              placeholder: 'Entrez votre adresse e-mail',
              validators: [
                Validators.required as unknown as ValidatorFn,
                Validators.email as unknown as ValidatorFn,
              ],
            },
            {
              name: 'password',
              type: 'password',
              label: 'Mot de passe',
              placeholder: 'Entrez votre mot de passe',
              validators: [
                Validators.required as unknown as ValidatorFn,
                Validators.minLength(8) as unknown as ValidatorFn
              ],
            },
            {
              name: 'password_confirmation',
              type: 'password',
              label: 'Confirmation du mot de passe',
              placeholder: 'Confirmez votre mot de passe',
              validators: [
                Validators.required as unknown as ValidatorFn
              ],
            },
          ],
          styles: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
        },
        {
          group: 'address',
          label: 'Adresse',
          description:
            'Vos données de résidence sont nécessaires pour vous mettre en relation avec des professionnels de santé.',
          fields: [
            {
              name: 'phone',
              type: 'tel',
              label: 'Téléphone',
              placeholder: 'Entrez votre numéro de téléphone',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'birthdate',
              type: 'date',
              label: 'Date de naissance',
              placeholder: 'Entrez votre date de naissance',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'address',
              type: 'text',
              label: 'Adresse',
              placeholder: 'Numéro, nom de la rue',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'city',
              type: 'text',
              label: 'Ville',
              placeholder: 'Ville de résidence',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'zipcode',
              type: 'text',
              label: 'Code postal',
              placeholder: 'Code postal de résidence',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'country',
              type: 'text',
              label: 'Pays',
              placeholder: 'Pays de résidence',
              validators: [Validators.required as unknown as ValidatorFn],
            },
          ],
          styles: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
        },
        {
          group: 'legal',
          label: 'Informations légales',
          description:
            'Pour garantir la sécurité de la plateforme, nous vous demandons de respecter les conditions et les règles qui régissent son utilisation.',
          fields: [
            {
              name: 'cgu',
              type: 'checkbox',
              label:
                "J'accepte les conditions générales d'utilisation, les conditions générales de ventes et la politique de confidentitalité",
              validators: [Validators.requiredTrue as unknown as ValidatorFn],
            },
            {
              name: 'contract',
              type: 'checkbox',
              label: "Je m'engage à respecter les règles de la plateforme",
              validators: [Validators.requiredTrue as unknown as ValidatorFn],
            },
          ],
          styles: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
        },
      ],
      submitLabel: "Je m'inscris",
      isIndexed: true,
    },
    professional: {
      fields: [
        {
          group: 'identity',
          label: 'Identité',
          description: 'Nous ne divulguerons jamais vos informations personnelles à des tiers.',
          fields: [
            {
              name: 'firstname',
              type: 'text',
              label: 'Prénom',
              placeholder: 'Entrez votre prénom',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'lastname',
              type: 'text',
              label: 'Nom de famille',
              placeholder: 'Entrez votre nom de famille',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'email',
              type: 'email',
              label: 'Adresse e-mail',
              placeholder: 'Entrez votre adresse e-mail',
              validators: [
                Validators.required as unknown as ValidatorFn,
                Validators.email as unknown as ValidatorFn,
              ],
            },
            {
              name: 'password',
              type: 'password',
              label: 'Mot de passe',
              placeholder: 'Entrez votre mot de passe',
              validators: [
                Validators.required as unknown as ValidatorFn,
                Validators.minLength(8) as unknown as ValidatorFn
              ],
            },
            {
              name: 'password_confirmation',
              type: 'password',
              label: 'Confirmation du mot de passe',
              placeholder: 'Confirmez votre mot de passe',
              validators: [
                Validators.required as unknown as ValidatorFn
              ],
            },
            {
              name: 'phone',
              type: 'tel',
              label: 'Téléphone',
              placeholder: 'Entrez votre numéro de téléphone',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'birthdate',
              type: 'date',
              label: 'Date de naissance',
              placeholder: 'Entrez votre date de naissance',
              validators: [Validators.required as unknown as ValidatorFn],
            },
          ],
          styles: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
        },
        {
          group: 'address',
          label: 'Adresse professionnelle',
          description:
            'Vos données de résidence professionnelle sont nécessaires pour vous mettre en relation avec des patients.',
          fields: [
            {
              name: 'address',
              type: 'text',
              label: 'Adresse',
              placeholder: 'Numéro et nom de la rue',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'city',
              type: 'text',
              label: 'Ville',
              placeholder: 'Ville de résidence professionnelle',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'zipcode',
              type: 'text',
              label: 'Code postal',
              placeholder: 'Code postal de résidence professionnelle',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'country',
              type: 'text',
              label: 'Pays',
              placeholder: 'Pays de résidence professionnelle',
              validators: [Validators.required as unknown as ValidatorFn],
            },
          ],
          styles: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
        },
        {
          group: 'professional',
          label: 'Métier',
          description:
            'Vos informations professionnelles sont nécessaires pour vous mettre en relation avec des patients. Votre inscription sera soumise à validation.',
          fields: [
            {
              name: 'medical_identification_number', 
              type: 'text',
              label: 'Numéro Adeli ou RPPS',
              placeholder: 'Entrez votre numéro Adeli ou RPPS',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'certification', 
              type: 'text',
              label: 'Spécialité / Certification',
              placeholder: 'Entrez votre spécialité',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'languages',
              type: 'text',
              label: 'Langues parlées (séparées par des virgules)',
              placeholder: 'Français, Anglais, etc.',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'experience',
              type: 'number',
              label: "Années d'expérience",
              placeholder: "Entrez vos années d'expérience",
              validators: [
                Validators.required as unknown as ValidatorFn,
                Validators.min(0) as unknown as ValidatorFn,
              ],
            },
            {
              name: 'company_name',
              type: 'text',
              label: 'Nom de l\'entreprise',
              placeholder: 'Entrez le nom de votre entreprise',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'company_identification_number',
              type: 'text',
              label: 'Numéro SIRET',
              placeholder: 'Entrez votre numéro SIRET',
              validators: [Validators.required as unknown as ValidatorFn],
            },
          ],
          styles: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
        },
        {
          group: 'legal',
          label: 'Informations légales',
          description:
            'Pour garantir la sécurité de la plateforme, nous vous demandons de respecter les conditions et les règles qui régissent son utilisation.',
          fields: [
            {
              name: 'cgu',
              type: 'checkbox',
              label:
                "J'accepte les conditions générales d'utilisation, les conditions générales de ventes et la politique de confidentialité",
              validators: [Validators.requiredTrue as unknown as ValidatorFn],
            },
            {
              name: 'contract',
              type: 'checkbox',
              label: "Je m'engage à respecter les règles de la plateforme",
              validators: [Validators.requiredTrue as unknown as ValidatorFn],
            },
          ],
          styles: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
        },
      ],
      submitLabel: "Je m'inscris",
      isIndexed: true,
    },
  };

  selectedAccount: 'user' | 'professional' = 'user';
  currentGroupIndex = 0;
  formError: string | null = null;
  formSuccess: string | null = null;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.setInitialFormValues();
  }

  onSelectAccount(account: 'user' | 'professional'): void {
    this.selectedAccount = account;
    this.currentGroupIndex = 0;
    this.formError = null;
    this.formSuccess = null;
    this.setInitialFormValues();
  }

  setInitialFormValues(): void {
    const email: string | null = localStorage.getItem('email');
    const password: string | null = localStorage.getItem('password');
    const groups: IFormGroup[] = this.signupConfig[this.selectedAccount].fields;

    groups.forEach((group: IFormGroup): void => {
      group.fields.forEach((field: IFormField): void => {
        if (field.name === 'email' && email) field.defaultValue = email;
        if (field.name === 'password' && password) field.defaultValue = password;
      });
    });
  }

  onNext(): void {
    if (this.currentGroupIndex < this.signupConfig[this.selectedAccount].fields.length - 1) {
      this.currentGroupIndex++;
    }
  }

  onPrevious(): void {
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
    }
  }

  isLastGroup(): boolean {
    return this.currentGroupIndex === this.signupConfig[this.selectedAccount].fields.length - 1;
  }

  isFirstGroup(): boolean {
    return this.currentGroupIndex === 0;
  }

  onFormSubmit(form: FormGroup): void {
    this.formError = null;
    this.formSuccess = null;
    this.isLoading = true;
    console.log('Formulaire soumis', form.value);
    
    const legalGroup = form.get('legal');
    
    const cguValue = legalGroup?.get('cgu')?.value;
    const contractValue = legalGroup?.get('contract')?.value;
    
    console.log('État du groupe legal:', legalGroup);
    console.log('Valeur de cgu:', cguValue);
    console.log('Valeur de contract:', contractValue);
    
    if (!cguValue || !contractValue) {
      this.formError = "Veuillez accepter les conditions générales et les règles de la plateforme pour continuer.";
      this.isLoading = false;
      
      const legalGroupIndex = this.signupConfig[this.selectedAccount].fields.findIndex(field => field.group === 'legal');
      if (legalGroupIndex !== -1) {
        this.currentGroupIndex = legalGroupIndex;
      }
      
      return;
    }
    
    const password = this.getNestedFormValue(form, 'password');
    const passwordConfirmation = this.getNestedFormValue(form, 'password_confirmation');
    
    if (password !== passwordConfirmation) {
      this.formError = "Les mots de passe ne correspondent pas.";
      form.setErrors({ passwordMismatch: true });
      form.markAllAsTouched();
      this.isLoading = false;
      
      this.currentGroupIndex = 0; 
      
      return;
    }

    const formData: { [key: string]: any } = {};
    
    Object.keys(form.controls).forEach(key => {
      if (form.get(key) instanceof FormGroup) {
        const group = form.get(key) as FormGroup;
        Object.keys(group.controls).forEach(controlKey => {
          formData[controlKey] = group.get(controlKey)?.value;
        });
      } else {
        formData[key] = form.get(key)!.value;
      }
    });
    
    console.log('Données de formulaire traitées:', formData);
    
    if (this.selectedAccount === 'user') {
      this.authService.registerPatient(formData).subscribe({
        next: (response) => {
          console.log('Réponse d\'inscription :', response);
          if (response) {
            console.log('Inscription réussie');
            this.formSuccess = "Inscription réussie ! Vous allez être redirigé vers la page de connexion.";
            
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 3000);
          } else {
            console.error('Échec de l\'inscription (réponse null)');
            this.formError = "Échec de l'inscription. Veuillez réessayer.";
            form.setErrors({ registrationFailed: true });
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur d\'inscription :', error);
          this.isLoading = false;
          
          if (error.status === 422 && error.error?.errors) {
            console.log('Erreurs de validation:', error.error.errors);
            
            const errorMessages = [];
            for (const field in error.error.errors) {
              errorMessages.push(`${field}: ${error.error.errors[field].join(', ')}`);
            }
            
            this.formError = `Erreurs de validation: ${errorMessages.join('; ')}`;
          } else if (error.error?.message) {
            this.formError = error.error.message;
          } else {
            this.formError = "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.";
          }
          
          form.setErrors({ registrationFailed: true });
        }
      });
    } else {
      this.authService.registerProfessional(formData).subscribe({
        next: (response) => {
          console.log('Réponse d\'inscription professionnelle :', response);
          if (response) {
            console.log('Inscription professionnelle réussie');
            this.formSuccess = "Inscription professionnelle réussie ! Vous allez être redirigé vers la page de connexion.";
            
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 3000);
          } else {
            console.error('Échec de l\'inscription professionnelle (réponse null)');
            this.formError = "Échec de l'inscription. Veuillez réessayer.";
            form.setErrors({ registrationFailed: true });
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur d\'inscription professionnelle :', error);
          this.isLoading = false;
          
          if (error.status === 422 && error.error?.errors) {
            console.log('Erreurs de validation:', error.error.errors);
            
            const errorMessages = [];
            for (const field in error.error.errors) {
              errorMessages.push(`${field}: ${error.error.errors[field].join(', ')}`);
            }
            
            this.formError = `Erreurs de validation: ${errorMessages.join('; ')}`;
          } else if (error.error?.message) {
            this.formError = error.error.message;
          } else {
            this.formError = "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.";
          }
          
          form.setErrors({ registrationFailed: true });
        }
      });
    }
  }

  private getNestedFormValue(form: FormGroup, fieldName: string): any {
    if (form.get(fieldName)) {
      return form.get(fieldName)?.value;
    }
    
    for (const key of Object.keys(form.controls)) {
      const control = form.get(key);
      if (control instanceof FormGroup && control.get(fieldName)) {
        return control.get(fieldName)?.value;
      }
    }
    
    return null;
  }
}
