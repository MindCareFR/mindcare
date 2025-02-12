import { AuthSignupComponent } from './auth-signup.component';
import { FormBuilder } from '@angular/forms';
import { AuthService, AuthResponse } from '@services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { IFormField } from '@interfaces/form.interface';

describe('AuthSignupComponent', (): void => {
  let component: AuthSignupComponent;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let fb: FormBuilder;

  beforeEach((): void => {
    fb = new FormBuilder();
    mockAuthService = jasmine.createSpyObj('AuthService', ['login']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    component = new AuthSignupComponent(mockAuthService, mockRouter, fb);

    component.signupConfig = {
      user: {
        fields: [
          {
            group: 'identity',
            fields: [
              { name: 'email', type: 'email', label: 'email', validators: [] },
              {
                name: 'password',
                type: 'password',
                label: 'password',
                validators: [],
              },
            ],
          },
        ],
        submitLabel: 'Submit',
        isIndexed: false,
      },
      professional: {
        fields: [],
        submitLabel: 'Submit',
        isIndexed: false,
      },
    };

    localStorage.setItem('email', 'test@example.com');
    localStorage.setItem('password', 'password123');

    component.ngOnInit();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', (): void => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'email') return 'test@example.com';
      if (key === 'password') return 'password123';
      return null;
    });
    component.ngOnInit();
    expect(component.selectedAccount).toBe('user');
    expect(component.currentGroupIndex).toBe(0);
  });

  it('should set email and password from localStorage', (): void => {
    spyOn(localStorage, 'getItem').and.returnValues(
      'test@example.com',
      'password123',
    );
    component.setInitialFormValues();
    const emailField: IFormField =
      component.signupConfig['user'].fields[0].fields[0];
    expect(emailField.defaultValue).toBe('test@example.com');
  });

  it('should submit the form when valid', (): void => {
    mockAuthService.login.and.returnValue(
      of({ token: 'token' } as AuthResponse),
    );

    const formGroup = fb.group({
      identity: fb.group({
        email: ['test@example.com'],
        password: ['password123'],
        remember: [true],
      }),
    });

    component.onFormSubmit(formGroup);

    expect(mockAuthService.login).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not submit the form when invalid', (): void => {
    const formGroup = fb.group({
      identity: fb.group({
        email: [''],
        password: [''],
        remember: [false],
      }),
    });
    formGroup.markAllAsTouched = jasmine.createSpy('markAllAsTouched');
    formGroup.setErrors({ invalid: true });

    component.onFormSubmit(formGroup);
    expect(formGroup.markAllAsTouched).toHaveBeenCalled();
  });
});