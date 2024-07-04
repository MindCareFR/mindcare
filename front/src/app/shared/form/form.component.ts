import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import type { IFormConfig, IFormFields } from '@interfaces/form.interface';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class FormComponent implements OnInit {
  @Input() config: IFormConfig = { fields: [], submitLabel: '', styles: '' };
  @Output() formSubmit: EventEmitter<FormGroup<any>> = new EventEmitter<FormGroup>();

  form: FormGroup = this.fb.group({});
  formSubmitted: boolean = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.config.fields.forEach((field: IFormFields): void => {
      const control: FormControl<string | null> = this.fb.control('', field.validators || []);
      this.form.addControl(field.name, control);
    });

    this.form.setValidators(this.passwordMatchValidator);
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.form.valid) {
      this.formSubmit.emit(this.form);
    } else {
      let controls = this.form.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          controls[name].markAsTouched();
        }
      }
    }
  }

  hasFormErrors(): boolean {
    return this.config.fields.some(field => this.form.get(field.name)?.invalid);
  }

  passwordMatchValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
    const password: AbstractControl<any, any> | null = form.get('password');
    const confirmPassword: AbstractControl<any, any> | null = form.get('confirm_password');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      return null;
    }
  };
}