import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { FooterComponent } from '@components/footer/footer.component';
import { FormComponent } from '@shared/form/form.component';
import type { IFormConfig, IFormFields } from '@interfaces/form.interface';

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
      { name: 'email', type: 'email', label: 'Adresse e-mail', placeholder: 'Entrez votre adresse e-mail', validators: [Validators.required, Validators.email] },
      { name: 'password', type: 'password', label: 'Mot de passe', placeholder: 'Entrez votre mot de passe', validators: [Validators.required, Validators.minLength(6), Validators.compose([Validators.pattern(/[a-z]/), Validators.pattern(/[A-Z]/), Validators.pattern(/[0-9]/)])] },
      { name: 'remember', type: 'checkbox', label: 'Se souvenir de moi', validators: [] },
    ],
    submitLabel: 'Me connecter'
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
      this.loginConfig.fields.forEach((field: IFormFields): void => {
        if (field.name === 'email') field.defaultValue = email;
        if (field.name === 'password') field.defaultValue = password;
        if (field.name === 'remember') field.defaultValue = true;
      });
    }
  }

  onFormSubmit(form: FormGroup): void {
    console.log('Form submitted')
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
          .subscribe(
            response => {
              if (response) {
                this.router.navigate(['/dashboard']);
              } else {
                form.setErrors({ invalidCredentials: true });
              }
            }
          );
      }
    } else {
      console.log('Form is invalid')
      form.markAllAsTouched();
    }
  }
}