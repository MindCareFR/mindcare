import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthLoginComponent } from './auth-login.component';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { FooterComponent } from '@components/footer/footer.component';
import { FormComponent } from '@shared/form/form.component';

class MockAuthService {
  login = jasmine.createSpy('login').and.returnValue(of({ token: 'mockToken' }));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockActivatedRoute {
  queryParams = of({});
}

describe('AuthLoginComponent', (): void => {
  let component: AuthLoginComponent;
  let fixture: ComponentFixture<AuthLoginComponent>;
  let mockAuthService: MockAuthService;
  let mockRouter: MockRouter;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommonModule, AuthLoginComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        FormBuilder,
      ],
    })
      .overrideComponent(AuthLoginComponent, {
        set: {
          imports: [ReactiveFormsModule, CommonModule],
          // Mock les composants que vous n'avez pas besoin de tester
          providers: [],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AuthLoginComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as unknown as MockAuthService;
    mockRouter = TestBed.inject(Router) as unknown as MockRouter;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should set email and password from localStorage', (): void => {
    localStorage.setItem('email', 'test@example.com');
    localStorage.setItem('password', 'password123');

    component.ngOnInit();

    expect(component.loginConfig.fields[0].fields[0].defaultValue).toBe('test@example.com');
    expect(component.loginConfig.fields[0].fields[1].defaultValue).toBe('password123');
  });

  it('should submit the form when valid', (): void => {
    // Créer un formulaire avec la structure attendue (credentials.email, credentials.password)
    const formGroup = new FormGroup({
      credentials: new FormGroup({
        email: new FormBuilder().control('test@example.com'),
        password: new FormBuilder().control('password123'),
        remember: new FormBuilder().control(true),
      }),
    });

    formGroup.markAsTouched();

    component.onFormSubmit(formGroup);

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(localStorage.getItem('email')).toBe('test@example.com');
    expect(localStorage.getItem('password')).toBe('password123');
  });

  it('should not submit the form when invalid', (): void => {
    const fb = new FormBuilder();

    // Créer un formulaire avec la structure attendue (credentials.email, credentials.password)
    const formGroup = fb.group({
      credentials: fb.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
        remember: [false],
      }),
    });

    spyOn(formGroup, 'markAllAsTouched');

    expect(formGroup.valid).toBeFalse();

    component.onFormSubmit(formGroup);

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(formGroup.markAllAsTouched).toHaveBeenCalled();
  });

  it('should handle login error', (): void => {
    mockAuthService.login.and.returnValue(of(null));

    // Créer un formulaire avec la structure attendue (credentials.email, credentials.password)
    const formGroup = new FormGroup({
      credentials: new FormGroup({
        email: new FormBuilder().control('test@example.com'),
        password: new FormBuilder().control('wrongpassword'),
        remember: new FormBuilder().control(false),
      }),
    });

    spyOn(formGroup, 'setErrors');

    component.onFormSubmit(formGroup);

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    expect(formGroup.setErrors).toHaveBeenCalledWith({
      invalidCredentials: true,
    });
  });

  afterEach(() => {
    // Nettoyage après chaque test
    localStorage.removeItem('email');
    localStorage.removeItem('password');
  });
});
