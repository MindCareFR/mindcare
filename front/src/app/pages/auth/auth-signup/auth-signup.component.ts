import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NavbarComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { FormComponent } from '@shared/form/form.component';
import {
  IFormConfig,
  IFormField,
  IFormGroup,
} from '@interfaces/form.interface';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import type { ValidatorFn } from '@interfaces/form.interface';

@Component({
  selector: 'app-auth-signup',
  standalone: true,
  templateUrl: './auth-signup.component.html',
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    FormComponent,
    ReactiveFormsModule,
  ],
})
export class AuthSignupComponent implements OnInit {
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
          label: 'Adresse',
          description:
            'Vos données de résidence sont nécessaires pour vous mettre en relation avec des professionnels de santé.',
          fields: [
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
          description:
            'Nous ne divulguerons jamais vos informations personnelles à des tiers.',
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
              name: 'adeli_rpps',
              type: 'text',
              label: 'Numéro Adeli ou RPPS',
              placeholder: 'Entrez votre numéro Adeli ou RPPS',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'speciality',
              type: 'text',
              label: 'Spécialité',
              placeholder: 'Entrez votre spécialité',
              validators: [Validators.required as unknown as ValidatorFn],
            },
            {
              name: 'degree',
              type: 'text',
              label: 'Diplôme',
              placeholder: 'Entrez votre diplôme',
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
              name: 'languages',
              type: 'text',
              label: 'Langues parlées',
              placeholder: 'Entrez les langues parlées',
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
  currentGroupIndex = 0; // Removed the type annotation

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.setInitialFormValues();
  }

  onSelectAccount(account: 'user' | 'professional'): void {
    this.selectedAccount = account;
    this.currentGroupIndex = 0;
    this.setInitialFormValues();
  }

  setInitialFormValues(): void {
    const email: string | null = localStorage.getItem('email');
    const password: string | null = localStorage.getItem('password');
    const groups: IFormGroup[] = this.signupConfig[this.selectedAccount].fields;

    groups.forEach((group: IFormGroup): void => {
      group.fields.forEach((field: IFormField): void => {
        if (field.name === 'email' && email) field.defaultValue = email;
        if (field.name === 'password' && password)
          field.defaultValue = password;
      });
    });
  }

  onNext(): void {
    if (
      this.currentGroupIndex <
      this.signupConfig[this.selectedAccount].fields.length - 1
    ) {
      this.currentGroupIndex++;
    }
  }

  onPrevious(): void {
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
    }
  }

  isLastGroup(): boolean {
    return (
      this.currentGroupIndex ===
      this.signupConfig[this.selectedAccount].fields.length - 1
    );
  }

  isFirstGroup(): boolean {
    return this.currentGroupIndex === 0;
  }

  onFormSubmit(form: FormGroup): void {
    console.log('Form submitted', form.value);
    if (form.valid) {
      const { email, password, remember } = form.value.identity;
      if (remember) {
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
      } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
      }
      if (email && password) {
        this.authService.login(email, password).subscribe((response) => {
          if (response) {
            this.router.navigate(['/dashboard']);
          } else {
            form.setErrors({ invalidCredentials: true });
          }
        });
      }
    } else {
      console.log('Form is invalid');
      form.markAllAsTouched();
    }
  }
}
