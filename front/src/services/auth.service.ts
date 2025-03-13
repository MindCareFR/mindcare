import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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

  login(email: string, password: string): Observable<AuthResponse | null> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map((response) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          return response;
        }),
        catchError((error) => {
          console.error('Login error', error);
          return of(null);
        })
      );
  }

  registerPatient(formData: any): Observable<AuthResponse | null> {
    const requiredFields = [
      'email', 'password', 'firstname', 'lastname', 'birthdate', 
      'phone', 'address', 'zipcode', 'city', 'country', 'gender'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      console.error('Champs manquants:', missingFields);
    }

    if (formData.password !== formData.password_confirmation) {
      console.error('Les mots de passe ne correspondent pas');
      return throwError(() => new Error('Les mots de passe ne correspondent pas'));
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

    // console.log('Payload d\'inscription patient:', payload);

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/patient`, payload)
      .pipe(
        map((response) => {
          console.log('Réponse d\'inscription', response);
          return response;
        }),
        catchError((error) => {
          console.error('Erreur d\'inscription', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          
          if (error.error) {
            console.error('Erreur détaillée:', error.error);
          }
          
          return throwError(() => error);
        })
      );
  }

  registerProfessional(formData: any): Observable<AuthResponse | null> {
    const requiredFields = [
      'email', 'password', 'firstname', 'lastname', 'birthdate', 
      'phone', 'address', 'zipcode', 'city', 'country', 'languages',
      'experience', 'certification', 'company_name', 'medical_identification_number',
      'company_identification_number'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      console.error('Champs manquants pour professionnel:', missingFields);
    }
    
    if (formData.password !== formData.password_confirmation) {
      console.error('Les mots de passe ne correspondent pas');
      return throwError(() => new Error('Les mots de passe ne correspondent pas'));
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
        catchError((error) => {
          console.error('Erreur d\'inscription professionnelle', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          
          if (error.error) {
            console.error('Erreur détaillée:', error.error);
          }
          
          return throwError(() => error);
        })
      );
  }

  verifyEmail(token: string): Observable<AuthResponse | null> {
    return this.http
      .get<AuthResponse>(`${this.apiUrl}/verify`, { 
        params: { token } 
      })
      .pipe(
        map((response) => {
          console.log('Email verification response', response);
          return response;
        }),
        catchError((error) => {
          console.error('Email verification error', error);
          return of(null);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
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
