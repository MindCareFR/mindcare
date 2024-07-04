import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { FooterComponent } from '@components/footer/footer.component';
import { FormComponent } from '@shared/form/form.component';
import { IFormConfig, IFormFields } from '@interfaces/form.interface';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-signup',
  standalone: true,
  templateUrl: './auth-signup.component.html',
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    FormComponent,
    ReactiveFormsModule
  ],
})
export class AuthSignupComponent implements OnInit {
  signupConfig: IFormConfig = {
    fields: [
      { name: 'firstname', type: 'text', label: 'Prénom', placeholder: 'Entrez votre prénom', validators: [Validators.required] },
      { name: 'lastname', type: 'text', label: 'Nom de famille', placeholder: 'Entrez votre nom de famille', validators: [Validators.required] },
      { name: 'birthdate', type: 'date', label: 'Date de naissance', placeholder: 'Entrez votre date de naissance', validators: [Validators.required] },
      { name: 'email', type: 'email', label: 'Adresse e-mail', placeholder: 'Entrez votre adresse e-mail', validators: [Validators.required, Validators.email] },
      { name: 'password', type: 'password', label: 'Mot de passe', placeholder: 'Entrez votre mot de passe', validators: [Validators.required, Validators.minLength(6), Validators.compose([Validators.pattern(/[a-z]/), Validators.pattern(/[A-Z]/), Validators.pattern(/[0-9]/)])] },
      { name: 'remember', type: 'checkbox', label: 'Se souvenir de moi', validators: [] },
    ],
    submitLabel: 'Me connecter'
  };

  selectedAccount: 'user' | 'professionnal' = 'user';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const email: string | null = localStorage.getItem('email');
    const password: string | null = localStorage.getItem('password');
    if (email && password) {
      this.signupConfig.fields.forEach((field: IFormFields): void => {
        if (field.name === 'email') field.defaultValue = email;
        if (field.name === 'password') field.defaultValue = password;
        if (field.name === 'remember') field.defaultValue = true;
      });
    }
  }

  onSelectAccount(account: 'user' | 'professionnal'): void {
    this.selectedAccount = account;
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
