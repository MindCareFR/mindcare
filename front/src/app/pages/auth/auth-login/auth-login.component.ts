import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { NavbarComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { FormComponent } from '@shared/form/form.component';
import type {
  IFormConfig,
  IFormField,
  IFormGroup,
  ValidatorFn,
} from '@interfaces/form.interface';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  templateUrl: './auth-login.component.html',
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    FormComponent,
    ReactiveFormsModule,
  ],
})
export class AuthLoginComponent implements OnInit {
  loginConfig: IFormConfig = {
    fields: [
      {
        group: 'credentials',
        label: 'Informations de connexion',
        description:
          'Veuillez saisir vos informations de connexion pour accéder à votre compte.',
        fields: [
          {
            name: 'email',
            type: 'email',
            label: 'Adresse e-mail',
            placeholder: 'Entrez votre adresse e-mail',
            validators: [
              Validators.required,
              Validators.email,
            ] as unknown as ValidatorFn[],
          },
          {
            name: 'password',
            type: 'password',
            label: 'Mot de passe',
            placeholder: 'Entrez votre mot de passe',
            validators: [Validators.required] as unknown as ValidatorFn[],
          },
          { name: 'remember', type: 'checkbox', label: 'Se souvenir de moi' },
        ],
        styles: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
      },
    ],
    submitLabel: 'Me connecter',
    isIndexed: false,
  };

  successMessage: string | null = null;
  errorMessage: string | null = null;
  errorMessageText: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    const email: string | null = localStorage.getItem('email');
    const password: string | null = localStorage.getItem('password');
    if (email && password) {
      const groups: IFormGroup[] = this.loginConfig.fields;

      groups.forEach((group: IFormGroup): void => {
        group.fields.forEach((field: IFormField): void => {
          if (field.name === 'email' && email) field.defaultValue = email;
          if (field.name === 'password' && password)
            field.defaultValue = password;
        });
      });
    }

    this.route.queryParams.subscribe(params => {
      if (params['status'] === 'success') {
        this.successMessage = params['message'] || 'Votre email a été vérifié avec succès !';
      } else if (params['status'] === 'error') {
        this.errorMessageText = params['message'] || 'Erreur lors de la vérification de l\'email.';
      }
    });
  }

  onFormSubmit(form: FormGroup): void {
    if (form.valid) {
      const credentials = form.value.credentials || {};
      const email = credentials.email;
      const password = credentials.password;
      const remember = credentials.remember;
      
      if (remember) {
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
      } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
      }
      
      this.successMessage = null;
      this.errorMessage = null;
      this.errorMessageText = '';
      
      if (email && password) {
        this.authService.login(email, password).subscribe(
          (response) => {
            if (response && response.token) {
              this.successMessage = 'Connexion réussie !';
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 1000);
            } else {
              // Définir le message d'erreur pour le composant de formulaire
              this.errorMessageText = 'Identifiants invalides. Veuillez réessayer.';
              form.setErrors({ invalidCredentials: true });
            }
          },
          (error) => {
            console.error('Erreur de connexion:', error);
            
            if (error && error.message) {
              this.errorMessageText = error.message;
            } else {
              this.errorMessageText = 'Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.';
            }
            
            form.setErrors({ serverError: true });
          }
        );
      }
    } else {
      this.errorMessageText = 'Veuillez remplir correctement tous les champs requis.';
      form.markAllAsTouched();
    }
  }
}