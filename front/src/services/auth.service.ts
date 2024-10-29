import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { IUserData } from '../app/interfaces/user.interface';

interface AuthResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://your-api-url.com/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse | null> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((response) => {
          localStorage.setItem('token', response.token);
          return response;
        }),
        catchError((error) => {
          console.error('Login error', error);
          return of(null);
        }),
      );
  }

  signup(data: IUserData): Observable<AuthResponse | null> {
    if (!this.checkInputsSignup(data)) {
      console.error('Invalid signup data');
      return of(null);
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/signup`, {
        ...data,
        birthdate: new Date(data.birthdate).toISOString(),
      })
      .pipe(
        map((response) => {
          localStorage.setItem('token', response.token);
          return response;
        }),
        catchError((error) => {
          console.error('Signup error', error);
          return of(null);
        }),
      );
  }

  checkInputsSignup(data: IUserData): boolean {
    const birthdateRegex = new RegExp(/^\d{2}\/\d{2}\/\d{4}$/);
    const emailRegex = new RegExp(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    );
    const phoneRegex = new RegExp(/^\d{10}$/);
    return (
      data.gender > 0 &&
      data.firstName.length > 3 &&
      data.lastName.length > 3 &&
      emailRegex.test(data.email) &&
      data.password.length > 5 &&
      data.password === data.confirmPassword &&
      birthdateRegex.test(data.birthdate) &&
      phoneRegex.test(data.phone) &&
      data.address.length > 3 &&
      data.city.length > 3 &&
      data.zipcode.length > 3 &&
      data.country.length > 3
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
