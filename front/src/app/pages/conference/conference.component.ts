import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VideoComponent } from '@shared/video/video.component';
import { FormComponent } from '@shared/form/form.component';
import { IFormConfig, IFormField, IFormGroup } from '@interfaces/form.interface';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faMicrophone, faMicrophoneSlash, faPhone, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-conference',
  standalone: true,
  imports: [
    VideoComponent,
    FontAwesomeModule,
    CommonModule,
    FormComponent,
    ReactiveFormsModule
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
              options: [
                '1 - Très mauvais',
                '2 - Mauvais',
                '3 - Moyen',
                '4 - Bon',
                '5 - Très bon'
              ]
            },
            { name: 'comment', type: 'textarea', label: 'Commentaire', placeholder: 'Laissez un commentaire sur la qualité de la communication', validators: [] }
          ]
        }
      ],
      submitLabel: 'Envoyer',
      cancelLabel: 'Annuler',
      styles: 'grid grid-cols-1 gap-4'
    }
  };

  constructor(
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
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
    console.log('Form submitted');
  }
}