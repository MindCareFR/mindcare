import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { FooterComponent } from '@components/footer/footer.component';
import { FormComponent } from '@shared/form/form.component';
import { ThemeService } from '@services/theme.service';
import type { IFormConfig, IFormField, IFormGroup, ValidatorFn } from '@interfaces/form.interface';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  templateUrl: './auth-login.component.html',
  imports: [CommonModule, NavbarComponent, FooterComponent, FormComponent, ReactiveFormsModule],
})
export class AuthLoginComponent implements OnInit {
  isDarkMode = false;

  loginConfig: IFormConfig = {
    fields: [
      {
        group: 'credentials',
        label: 'Informations de connexion',
        description: 'Veuillez saisir vos informations de connexion pour accéder à votre compte.',
        fields: [
          {
            name: 'email',
            type: 'email',
            label: 'Adresse e-mail',
            placeholder: 'Entrez votre adresse e-mail',
            validators: [Validators.required, Validators.email] as unknown as ValidatorFn[],
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements de thème
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    const email: string | null = localStorage.getItem('email');
    const password: string | null = localStorage.getItem('password');
    if (email && password) {
      const groups: IFormGroup[] = this.loginConfig.fields;

      groups.forEach((group: IFormGroup): void => {
        group.fields.forEach((field: IFormField): void => {
          if (field.name === 'email' && email) field.defaultValue = email;
          if (field.name === 'password' && password) field.defaultValue = password;
        });
      });
    }

    this.route.queryParams.subscribe(params => {
      if (params['status'] === 'success') {
        this.successMessage = params['message'] || 'Votre email a été vérifié avec succès !';
      } else if (params['status'] === 'error') {
        this.errorMessage = params['message'] || "Erreur lors de la vérification de l'email.";
      }
    });
  }

  onFormSubmit(form: FormGroup | any): void {
    if (form instanceof FormGroup && form.valid) {
      // Accéder aux informations d'identification correctement
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

      if (email && password) {
        this.authService.login(email, password).subscribe({
          next: response => {
            if (response && response.token) {
              this.successMessage = 'Connexion réussie!';
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 1000);
            } else {
              form.setErrors({ invalidCredentials: true });
              this.errorMessage = 'Email ou mot de passe incorrect.';
            }
          },
          error: err => {
            form.setErrors({ invalidCredentials: true });
            this.errorMessage = 'Erreur de connexion. Veuillez réessayer.';
          },
        });
      } else {
        this.errorMessage = 'Veuillez entrer votre email et votre mot de passe.';
      }
    } else {
      if (form instanceof FormGroup) {
        form.markAllAsTouched();
      }
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
    }
  }
}
