import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import type { IFormConfig, IFormFields } from '@interfaces/form.interface';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class FormComponent implements OnInit {
  @Input() config: IFormConfig = { fields: [], submitLabel: '' };
  @Output() formSubmit: EventEmitter<FormGroup<any>> = new EventEmitter<FormGroup>();

  form: FormGroup = this.fb.group({});
  formSubmitted: boolean = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.config.fields.forEach((field: IFormFields): void => {
      const control: FormControl<string | null> = this.fb.control('', field.validators || []);
      this.form.addControl(field.name, control);
    });
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
}