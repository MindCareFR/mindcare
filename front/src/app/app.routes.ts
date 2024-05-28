import { Routes } from '@angular/router';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { AppHomeComponent } from './app-home/app-home.component';

export const routes: Routes = [
  { path: 'auth/login', component: AuthLoginComponent },
  { path: '', component: AppHomeComponent },
  { path: '**', redirectTo: '' }
];
