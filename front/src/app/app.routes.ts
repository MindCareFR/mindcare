import { Routes } from '@angular/router';
import { AuthLoginComponent } from './pages/auth/auth-login/auth-login.component';
import { AuthSignupComponent } from './pages/auth/auth-signup/auth-signup.component';
import { ConferenceComponent } from './pages/conference/conference.component';
import { AppHomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { NotFoundComponent } from './pages/page404/page404.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { UserProfileComponent } from './dashboard/components/profile/user-profile.component';

export const routes: Routes = [
  { path: 'auth/login', component: AuthLoginComponent },
  { path: 'auth/signup', component: AuthSignupComponent },
  { path: 'conference', component: ConferenceComponent },
  { path: 'contact', component: ContactComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'profile', component: UserProfileComponent },
      {
        path: 'settings',
        loadChildren: () =>
          import('./dashboard/components/setting/setting.module').then(m => m.SettingsModule),
      },
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
    ],
  },
  { path: '', component: AppHomeComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' },
];
