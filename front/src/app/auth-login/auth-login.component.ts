import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  templateUrl: './auth-login.component.html',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ]
})
export class AuthLoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    const password = localStorage.getItem('password');
    if (email && password) {
      this.loginForm.patchValue({
        email,
        password,
        remember: true
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password, remember } = this.loginForm.value;
      if (remember) {
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
      }
      if (email && password) {
        // this.authService.login(email, password)
        //   .pipe(
        //     switchMap(() => this.router.navigate(['/dashboard'])),
        //     catchError(error => {
        //       this.loginForm.setErrors({ invalidCredentials: true });
        //       return of(null);
        //     })
        //   )
        //   .subscribe();

        this.authService.login(email, password)
          .subscribe(
            response => {
              if (response) {
                this.router.navigate(['/dashboard']);
              } else {
                this.loginForm.setErrors({ invalidCredentials: true });
              }
            }
        );
      }
    }
  }
}