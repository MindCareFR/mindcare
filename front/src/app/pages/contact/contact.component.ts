import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { NavbarComponent } from '@components/header/header.component';
import { FooterComponent } from '@components/footer/footer.component';
import { FormComponent } from '@shared/form/form.component';
import { IFormConfig } from '@interfaces/form.interface';
import {ContactService} from '@services/contact.service';
import {ToastService} from '@services/toast.service';


@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    FormComponent,
    ReactiveFormsModule
  ],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  appName = 'MindCare';

  contactConfig: IFormConfig = {
    fields: [
      {
        group: 'contact',
        label: 'Informations de contact',
        description: 'Tous les champs sont obligatoires pour traiter votre demande',
        fields: [
          {
            name: 'firstName',
            type: 'text',
            label: 'Prénom',
            placeholder: 'Entrez votre prénom',
            validators: [Validators.required, Validators.minLength(2)],
            width: 'md:col-span-1'
          },
          {
            name: 'lastName',
            type: 'text',
            label: 'Nom',
            placeholder: 'Entrez votre nom',
            validators: [Validators.required, Validators.minLength(2)],
            width: 'md:col-span-1'
          },
          {
            name: 'email',
            type: 'email',
            label: 'Adresse email',
            placeholder: 'exemple@mindcare.com',
            validators: [Validators.required, Validators.email],
            width: 'md:col-span-2'
          },
          {
            name: 'subject',
            type: 'select',
            label: 'Sujet',
            placeholder: 'Sélectionnez un sujet',
            options: [
              'Support technique',
              'Question facturation',
              'Demande de partenariat',
              'Autre'
            ],
            validators: [Validators.required],
            width: 'md:col-span-2'
          },
          {
            name: 'message',
            type: 'textarea',
            label: 'Message',
            placeholder: 'Décrivez votre demande en détail...',
            validators: [Validators.required, Validators.minLength(20)],
            rows: 8,
            width: 'md:col-span-2'
          },
        ],
        styles: 'grid grid-cols-1 gap-4 md:grid-cols-1'
      }
    ],
    submitLabel: 'Envoyer votre message',
    isIndexed: false
  };

  constructor(
    private contactService: ContactService,
    private toastService: ToastService
  ) {}

  onFormSubmit(form: FormGroup): void {
    if (form.valid) {
      const formData = form.value.contact;

      this.contactService.sendMessage(formData).subscribe({
        next: (response: any) => {
          this.toastService.success('Votre message a bien été envoyé');
          form.reset();
        },
        error: (error: any) => {
          this.toastService.error('Une erreur est survenue lors de l\'envoi');
          console.error('Erreur d\'envoi de message', error);
        }
      });
    } else {
      this.toastService.error('Veuillez remplir correctement tous les champs');
    }
  }
}
