import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { FooterComponent } from '@components/footer/footer.component';
import { FormComponent } from '@shared/form/form.component';
import type { IFormConfig, IFormField, IFormGroup, ValidatorFn } from '@interfaces/form.interface';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  templateUrl: './auth-login.component.html',
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    FormComponent,
    ReactiveFormsModule
  ],
})
export class AuthLoginComponent implements OnInit {
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
            validators: [Validators.required, Validators.email] as unknown as ValidatorFn[]
          },
          { 
            name: 'password', 
            type: 'password', 
            label: 'Mot de passe', 
            placeholder: 'Entrez votre mot de passe', 
            validators: [Validators.required] as unknown as ValidatorFn[]
          },
          { name: 'remember', type: 'checkbox', label: 'Se souvenir de moi' }
        ],
        styles: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
      }
    ],
    submitLabel: 'Me connecter',
    isIndexed: false
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
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
  }

  onFormSubmit(form: FormGroup): void {
    console.log('Form submitted');
    if (form.valid) {
      const { email, password, remember } = form.value;
      if (remember) {
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
      } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
      }
      if (email && password) {
        this.authService.login(email, password)
          .subscribe(response => {
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
