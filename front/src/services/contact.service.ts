import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnement';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  /**
   * Sends the contact form data to the backend API
   * @param formData Form data containing contact information
   * @returns Observable of the response from the API
   */
  sendMessage(formData: ContactFormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact`, formData);
  }
}
