import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faMicrophone, faMicrophoneSlash, faPhone, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { VideoComponent } from '@shared/video/video.component';
import { FormComponent } from '@shared/form/form.component';
import { MedicalRecordComponent } from '@shared/medical-record/medical-record.component';
import { ProgressStatComponent } from '@shared/progress-stat/progress-stat.component';
import { ChatComponent } from '@shared/chat/chat.component';
import { IFormConfig, IFormField, IFormGroup } from '@interfaces/form.interface';

@Component({
  selector: 'app-conference',
  standalone: true,
  imports: [
    VideoComponent,
    FontAwesomeModule,
    CommonModule,
    FormComponent,
    ReactiveFormsModule,
    MedicalRecordComponent,
    ProgressStatComponent,
    ChatComponent
  ],
  templateUrl: './conference.component.html',
})
export class ConferenceComponent implements OnInit {
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  muted: boolean = false;
  isSideDashboardOpen: boolean = false;
  callEnded: boolean = false;
  showSatisfactionForm: boolean = false;
  faMicrophone: IconDefinition = faMicrophone;
  faMicrophoneSlash: IconDefinition = faMicrophoneSlash;
  faPhone: IconDefinition = faPhone;
  faBars: IconDefinition = faBars;
  faTimes: IconDefinition = faTimes;

  satisfactionFormConfig: { [key: string]: IFormConfig } = {
    'satisfaction': {
      fields: [
        {
          group: 'satisfaction',
          label: 'Satisfaction',
          description: 'Merci de nous donner votre avis sur la qualité de la communication.',
          fields: [
            { 
              name: 'rating', 
              type: 'select',
              label: 'Note',
              placeholder: 'Sélectionnez une note',
              validators: [Validators.required],
              options: [ '1 - Très mauvais', '2 - Mauvais', '3 - Moyen', '4 - Bon', '5 - Très bon' ]
            },
            { name: 'comment', type: 'textarea', label: 'Commentaire', placeholder: 'Laissez un commentaire sur la qualité de la communication', validators: [] }
          ]
        }
      ],
      submitLabel: 'Envoyer',
      cancelLabel: 'Annuler',
      styles: 'grid grid-cols-1 gap-4',
      isIndexed: false
    }
  };

  prescriptionForm: FormGroup;
  prescriptionFormSubmitted: boolean = false;
  @Output() prescriptionSubmit: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  showPrescriptionForm: boolean = false;

  constructor(private fb: FormBuilder) {
    this.prescriptionForm = this.fb.group({
      prescriptions: this.fb.array([this.createPrescriptionGroup()])
    });
  }

  ngOnInit() {
    this.initializeMedia();
  }

  createPrescriptionGroup(): FormGroup {
    return this.fb.group({
      drug: ['', Validators.required],
      dosage: ['', Validators.required],
      duration: ['', Validators.required],
      comment: ['']
    });
  }

  get prescriptions(): FormArray {
    return this.prescriptionForm.get('prescriptions') as FormArray;
  }

  async initializeMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('Local stream obtained:', this.localStream);
      this.remoteStream = new MediaStream(this.localStream.getVideoTracks());
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => track.enabled = !this.muted);
    }
  }

  hangUp() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    this.callEnded = true;
    setTimeout(() => {
      this.showSatisfactionForm = true;
    }, 3000);
  }

  toggleSideDashboard() {
    this.isSideDashboardOpen = !this.isSideDashboardOpen;
  }

  onFormSubmit(form: FormGroup): void {
    if (form.valid) {
      console.log('Form submitted', form.value);
    } else {
      console.log('Form is invalid');
    }
  }

  onPrescriptionFormSubmit(form: FormGroup): void {
    if (form.valid) {
      console.log('Subscription form submitted', form.value);
    } else {
      console.log('Subscription form is invalid 2');
    }
  }

  togglePrescriptionSection(): void {
    this.showPrescriptionForm = !this.showPrescriptionForm;
  }

  addPrescription(): void {
    this.prescriptions.push(this.createPrescriptionGroup());
  }

  removePrescription(index: number): void {
    this.prescriptions.removeAt(index);
  }

  onSubmitPrescription(): void {
    this.prescriptionFormSubmitted = true;
    if (this.prescriptionForm.valid) {
      console.log('Prescription form submitted', this.prescriptionForm.value);
      this.prescriptionSubmit.emit(this.prescriptionForm);
    } else {
      console.log('Prescription form is invalid');
      const controls = this.prescriptionForm.get('prescriptions') as FormArray;
      controls.controls.forEach(control => {
        if (control.invalid) {
          control.markAllAsTouched();
        }
      });
    }
  }  

  hasPrescriptionFormErrors(): boolean {
    return Object.keys(this.prescriptionForm.controls).some(group => {
      const groupControl = this.prescriptionForm.get(group) as FormGroup;
      return Object.keys(groupControl.controls).some(field => groupControl.get(field)?.invalid);
    });
  }
}