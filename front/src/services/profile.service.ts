import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // URL de base pour les endpoints d'authentification
  private authUrl = 'http://localhost:8000/api/auth';
  // URL de base pour les endpoints de mise à jour du profil et autres actions
  private profileUrl = 'http://localhost:8000/api/profile';

  constructor(private http: HttpClient) { }

  // Helpers privés
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error('Error details:', error);
      return of(result as T);
    };
  }

  // Méthode de récupération du profil via l'endpoint d'authentification
  getProfile(): Observable<any> {
    return this.http.get(`${this.authUrl}/user-profile`, { headers: this.getHeaders() })
        .pipe(
            tap(data => console.log('Profile data received:', data)),
            catchError(this.handleError('getProfile', null))
        );
  }

  getReviews(): Observable<any> {
    return this.http.get(`${this.profileUrl}/reviews`, { headers: this.getHeaders() })
        .pipe(
            tap(data => console.log('Reviews data received:', data)),
            catchError(this.handleError('getReviews', []))
        );
  }

  updateBasicInfo(data: any): Observable<any> {
    return this.http.put(`${this.profileUrl}/basic`, data, { headers: this.getHeaders() })
        .pipe(
            tap(response => console.log('Basic info updated:', response)),
            catchError(this.handleError('updateBasicInfo', null))
        );
  }

  updatePatientProfile(data: any): Observable<any> {
    return this.http.put(`${this.profileUrl}/patient`, data, { headers: this.getHeaders() })
        .pipe(
            tap(response => console.log('Patient profile updated:', response)),
            catchError(this.handleError('updatePatientProfile', null))
        );
  }

  updateProfessionalProfile(data: any): Observable<any> {
    return this.http.put(`${this.profileUrl}/professional`, data, { headers: this.getHeaders() })
        .pipe(
            tap(response => console.log('Professional profile updated:', response)),
            catchError(this.handleError('updateProfessionalProfile', null))
        );
  }

  initPreferences(): Observable<any> {
    return this.http.get(`${this.profileUrl}/preferences/init`, { headers: this.getHeaders() })
        .pipe(
            tap(data => console.log('Preferences initialized:', data)),
            catchError(this.handleError('initPreferences', null))
        );
  }

  updatePreferences(data: any): Observable<any> {
    return this.http.put(`${this.profileUrl}/preferences`, data, { headers: this.getHeaders() })
        .pipe(
            tap(response => console.log('Preferences updated:', response)),
            catchError(this.handleError('updatePreferences', null))
        );
  }

  submitReview(professionalUuid: string, reviewData: any): Observable<any> {
    return this.http.post(
        `${this.profileUrl}/professional/${professionalUuid}/review`,
        reviewData,
        { headers: this.getHeaders() }
    ).pipe(
        tap(response => console.log('Review submitted:', response)),
        catchError(this.handleError('submitReview', null))
    );
  }

  getPublicProfile(userUuid: string): Observable<any> {
    return this.http.get(`${this.profileUrl}/${userUuid}`)
        .pipe(
            tap(data => console.log('Public profile received:', data)),
            catchError(this.handleError('getPublicProfile', null))
        );
  }
}
