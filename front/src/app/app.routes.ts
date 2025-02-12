import { Routes } from '@angular/router';
import { AuthLoginComponent } from './pages/auth/auth-login/auth-login.component';
import { AuthSignupComponent } from './pages/auth/auth-signup/auth-signup.component';
import { AppHomeComponent } from './pages/home/home.component';
import { ConferenceComponent } from './pages/conference/conference.component';

export const routes: Routes = [
  { path: 'auth/login', component: AuthLoginComponent },
  { path: 'auth/signup', component: AuthSignupComponent },
  { path: 'conference', component: ConferenceComponent },
  { path: '', component: AppHomeComponent },
  { path: '**', redirectTo: '' },
];