import { Routes } from '@angular/router';
import { AuthLoginComponent } from './pages/auth/auth-login/auth-login.component';
import { AuthSignupComponent } from './pages/auth/auth-signup/auth-signup.component';
import { ConferenceComponent } from './pages/conference/conference.component';
import { AppHomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { NotFoundComponent } from './pages/page404/page404.component';
import {DashboardComponent} from './dashboard/dashboard.component';

// import { DashboardOverviewComponent } from './pages/dashboard/components/dashboard-overview/dashboard-overview.component';
// import { SessionsComponent } from './pages/dashboard/components/sessions/sessions.component';
// import { AppointmentsComponent } from './pages/dashboard/components/appointments/appointments.component';
// import { ResourcesComponent } from './pages/dashboard/components/resources/resources.component';
// import { MessagesComponent } from './pages/dashboard/components/messages/messages.component';
// import { ProfileComponent } from './pages/dashboard/components/profile/profile.component';
// import { SettingsComponent } from './pages/dashboard/components/settings/settings.component';
// import { SupportComponent } from './pages/dashboard/components/support/support.component';

export const routes: Routes = [
  { path: 'auth/login', component: AuthLoginComponent },
  { path: 'auth/signup', component: AuthSignupComponent },
  { path: 'conference', component: ConferenceComponent },
  { path: 'contact', component: ContactComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    /*
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: DashboardOverviewComponent },
      { path: 'sessions', component: SessionsComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'resources', component: ResourcesComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'support', component: SupportComponent },
    ]
    */
  },
  { path: '', component: AppHomeComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' },
];
