import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {AuthResponse, AuthService} from '@services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should login successfully', () => {
    const mockLoginResponse: AuthResponse = {
      token: 'mock_token_123',
      user: {
        email: 'test@example.com',
        role: { name: 'ROLE_PATIENT' }
      }
    };

    service.login('test@example.com', 'password123').subscribe(response => {
      expect(response).toEqual(mockLoginResponse);
      expect(localStorage.getItem('token')).toBe('mock_token_123');
    });

    const req = httpMock.expectOne('http://localhost:8000/api/auth/login');
    req.flush(mockLoginResponse);
  });

  it('should retrieve user profile', () => {
    const mockUserProfile = {
      email: 'test@example.com',
      role: { name: 'ROLE_PATIENT' }
    };

    localStorage.setItem('token', 'mock_token_123');

    service.getUserProfile().subscribe(profile => {
      expect(profile).toEqual(mockUserProfile);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/auth/user-profile');
    req.flush(mockUserProfile);
  });

  it('should check authentication status', () => {
    expect(service.isAuthenticated()).toBeFalsy();

    localStorage.setItem('token', 'mock_token_123');
    expect(service.isAuthenticated()).toBeTruthy();
  });

  it('should logout correctly', () => {
    localStorage.setItem('token', 'mock_token_123');
    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should register a patient', () => {
    const patientData = {
      email: 'jane@example.com',
      password: 'password123'
    };

    const mockRegistrationResponse: AuthResponse = {
      message: 'Patient registered successfully'
    };

    service.registerPatient(patientData).subscribe(response => {
      expect(response).toEqual(mockRegistrationResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/auth/register/patient');
    req.flush(mockRegistrationResponse);
  });
});
