import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface AuthResponse {
  message?: string;
  token?: string;
  user_id?: string;
  errors?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth'; 

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((response) => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            if (response.user_id) {
              localStorage.setItem('user_id', response.user_id);
            }
          }
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Une erreur est survenue';
          
          if (error.error instanceof ErrorEvent) {
            errorMessage = `Erreur: ${error.error.message}`;
          } else {
            if (error.status === 401) {
              errorMessage = 'Email ou mot de passe incorrect';
            } else if (error.status === 403) {
              errorMessage = 'Votre compte n\'a pas encore été activé';
            } else if (error.status === 404) {
              errorMessage = 'Aucun compte n\'est associé à cet email';
            } else if (error.status === 429) {
              errorMessage = 'Trop de tentatives de connexion';
            } else if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          }
          
          return throwError(() => {
            return {
              message: errorMessage,
              status: error.status,
              error: error.error
            };
          });
        })
      );
  }

  registerPatient(formData: any): Observable<AuthResponse> {
    const requiredFields = [
      'email', 'password', 'firstname', 'lastname', 'birthdate', 
      'phone', 'address', 'zipcode', 'city', 'country', 'gender'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      console.error('Champs manquants:', missingFields);
      return throwError(() => ({
        message: `Champs manquants: ${missingFields.join(', ')}`,
        status: 400,
        error: { missingFields }
      }));
    }

    if (formData.password !== formData.password_confirmation) {
      console.error('Les mots de passe ne correspondent pas');
      return throwError(() => ({
        message: 'Les mots de passe ne correspondent pas',
        status: 400,
        error: { passwordMismatch: true }
      }));
    }

    const payload = {
      email: formData.email || '',
      password: formData.password || '',
      firstname: formData.firstname || '',
      lastname: formData.lastname || '',
      birthdate: this.formatBirthdate(formData.birthdate || ''),
      phone: formData.phone || '',
      address: formData.address || '',
      address_complement: formData.address_complement || '',
      zipcode: formData.zipcode || '',
      city: formData.city || '',
      country: formData.country || '',
      gender: this.mapGender(formData.gender || ''),
      is_anonymous: formData.is_anonymous || false
    };

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/patient`, payload)
      .pipe(
        map((response) => {
          console.log('Réponse d\'inscription', response);
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Erreur d\'inscription', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          
          let errorMessage = 'Une erreur est survenue lors de l\'inscription';
          
          if (error.status === 422 && error.error && error.error.errors) {
            const validationErrors = Object.values(error.error.errors).flat();
            errorMessage = Array.isArray(validationErrors) ? validationErrors.join(', ') : String(validationErrors);
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          if (error.error) {
            console.error('Erreur détaillée:', error.error);
          }
          
          return throwError(() => ({
            message: errorMessage,
            status: error.status,
            error: error.error
          }));
        })
      );
  }

  registerProfessional(formData: any): Observable<AuthResponse> {
    const requiredFields = [
      'email', 'password', 'firstname', 'lastname', 'birthdate', 
      'phone', 'address', 'zipcode', 'city', 'country', 'languages',
      'experience', 'certification', 'company_name', 'medical_identification_number',
      'company_identification_number'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      console.error('Champs manquants pour professionnel:', missingFields);
      return throwError(() => ({
        message: `Champs manquants: ${missingFields.join(', ')}`,
        status: 400,
        error: { missingFields }
      }));
    }
    
    if (formData.password !== formData.password_confirmation) {
      console.error('Les mots de passe ne correspondent pas');
      return throwError(() => ({
        message: 'Les mots de passe ne correspondent pas',
        status: 400,
        error: { passwordMismatch: true }
      }));
    }
  
    let languages = [];
    if (typeof formData.languages === 'string') {
      languages = formData.languages.split(',').map((lang: string) => lang.trim());
    } else if (Array.isArray(formData.languages)) {
      languages = formData.languages;
    } else if (formData.languages) {
      languages = [formData.languages];
    }
  
    const payload = {
      email: formData.email || '',
      password: formData.password || '',
      firstname: formData.firstname || '',
      lastname: formData.lastname || '',
      birthdate: this.formatBirthdate(formData.birthdate || ''),
      phone: formData.phone || '',
      address: formData.address || '',
      address_complement: formData.address_complement || '',
      zipcode: formData.zipcode || '',
      city: formData.city || '',
      country: formData.country || '',
      languages: languages,
      experience: parseInt(formData.experience) || 0,
      certification: formData.speciality || formData.degree || formData.certification || '',
      company_name: formData.company_name || '',
      medical_identification_number: formData.adeli_rpps || formData.medical_identification_number || '',
      company_identification_number: formData.company_identification_number || ''
    };
  
    console.log('Payload professionnel envoyé à l\'API:', payload);
  
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/pro`, payload)
      .pipe(
        map((response) => {
          console.log('Réponse d\'inscription professionnelle:', response);
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Erreur d\'inscription professionnelle', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          
          let errorMessage = 'Une erreur est survenue lors de l\'inscription';
          
          if (error.status === 422 && error.error && error.error.errors) {
            const validationErrors = Object.values(error.error.errors).flat();
            errorMessage = Array.isArray(validationErrors) ? validationErrors.join(', ') : String(validationErrors);
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          if (error.error) {
            console.error('Erreur détaillée:', error.error);
          }
          
          return throwError(() => ({
            message: errorMessage,
            status: error.status,
            error: error.error
          }));
        })
      );
  }

  verifyEmail(token: string): Observable<AuthResponse> {
    return this.http
      .get<AuthResponse>(`${this.apiUrl}/verify`, { 
        params: { token } 
      })
      .pipe(
        map((response) => {
          console.log('Email verification response', response);
          return response;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Email verification error', error);
          
          let errorMessage = 'Erreur lors de la vérification de l\'email';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          return throwError(() => ({
            message: errorMessage,
            status: error.status,
            error: error.error
          }));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private formatBirthdate(birthdate: string): string {
    if (!birthdate) return '';
    
    if (birthdate.includes('/')) {
      const [day, month, year] = birthdate.split('/');
      return `${year}-${month}-${day}`;
    } else if (birthdate.includes('-')) {
      const parts = birthdate.split('-');
      if (parts[0].length === 4) {
        return birthdate; 
      } else {
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
      }
    }
    
    try {
      const date = new Date(birthdate);
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error('Erreur d\'analyse de date:', e);
      return birthdate;
    }
  }

  private mapGender(gender: string): string {
    if (!gender) return 'Autre';
    
    switch(gender) {
      case 'Monsieur': return 'Homme';
      case 'Madame': return 'Femme';
      default: return gender;
    }
  }
}