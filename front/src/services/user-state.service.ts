import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define user profile interface (expand as needed based on your user model)
export interface UserProfile {
  firstname?: string;
  lastname?: string;
  email?: string;
  avatar?: string;
  role?: string | { name: string };
  // Add other profile fields as needed
}

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  // BehaviorSubject to maintain the current user profile state
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);

  // Observable that components can subscribe to
  currentUserProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable();

  constructor() {}

  // Update the user profile state
  updateUserProfile(profile: UserProfile): void {
    this.userProfileSubject.next(profile);
  }

  // Get the current value without subscribing
  getCurrentUserProfile(): UserProfile | null {
    return this.userProfileSubject.getValue();
  }

  // Clear user profile (e.g., on logout)
  clearUserProfile(): void {
    this.userProfileSubject.next(null);
  }
}
