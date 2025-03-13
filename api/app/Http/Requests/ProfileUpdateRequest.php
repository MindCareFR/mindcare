<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true; // L'authentification est gérée par le middleware auth:sanctum
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $rules = [
            // Règles pour les informations de base
            'basic' => [
                'firstname' => 'sometimes|string|max:255',
                'lastname' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'address' => 'sometimes|string|max:255',
                'address_complement' => 'sometimes|nullable|string|max:255',
                'zipcode' => 'sometimes|string|max:20',
                'city' => 'sometimes|string|max:100',
                'country' => 'sometimes|string|max:100',
                'profile_image' => 'sometimes|nullable|image|max:2048',
            ],
            
            // Règles pour les préférences
            'preferences' => [
                'app_notifications' => 'sometimes|array',
                'app_notifications.messages' => 'sometimes|boolean',
                'app_notifications.appointments' => 'sometimes|boolean',
                'app_notifications.reminders' => 'sometimes|boolean',
                'app_notifications.updates' => 'sometimes|boolean',
                
                'push_notifications' => 'sometimes|array',
                'push_notifications.messages' => 'sometimes|boolean',
                'push_notifications.appointments' => 'sometimes|boolean',
                'push_notifications.reminders' => 'sometimes|boolean',
                'push_notifications.updates' => 'sometimes|boolean',
                
                'email_notifications' => 'sometimes|array',
                'email_notifications.messages' => 'sometimes|boolean',
                'email_notifications.appointments' => 'sometimes|boolean',
                'email_notifications.reminders' => 'sometimes|boolean',
                'email_notifications.updates' => 'sometimes|boolean',
                'email_notifications.newsletter' => 'sometimes|boolean',
                
                'profile_visibility' => 'sometimes|array',
                'profile_visibility.full_name' => 'sometimes|boolean',
                'profile_visibility.email' => 'sometimes|boolean',
                'profile_visibility.phone' => 'sometimes|boolean',
                'profile_visibility.address' => 'sometimes|boolean',
            ],
            
            // Règles pour les profils professionnels
            'professional' => [
                'languages' => 'sometimes|array',
                'languages.*' => 'string',
                'experience' => 'sometimes|integer|min:0',
                'certification' => 'sometimes|string',
                'specialties' => 'sometimes|array',
                'specialties.*' => 'string',
                'availability_hours' => 'sometimes|array',
                'biography' => 'sometimes|string',
                'education' => 'sometimes|array',
                'education.*.institution' => 'required_with:education|string',
                'education.*.degree' => 'required_with:education|string',
                'education.*.year' => 'required_with:education|integer|min:1900|max:' . date('Y'),
                'company_name' => 'sometimes|string|max:255',
                'medical_identification_number' => 'sometimes|string|max:255',
                'company_identification_number' => 'sometimes|string|max:255',
                'therapy_domains' => 'sometimes|array',
                'therapy_domains.*' => 'exists:therapy_domains,id',
            ],
            
            // Règles pour les profils patients
            'patient' => [
                'gender' => ['sometimes', Rule::in(['Homme', 'Femme', 'Autre'])],
                'is_anonymous' => 'sometimes|boolean',
                'birthdate' => 'sometimes|date|before:today',
            ],
            
            // Règles pour les évaluations
            'review' => [
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000',
                'is_anonymous' => 'sometimes|boolean',
            ],
        ];
        
        // Déterminer quelles règles appliquer en fonction de la route
        $routeName = $this->route()->getName();
        
        if (strpos($routeName, 'basic') !== false) {
            return $rules['basic'];
        } elseif (strpos($routeName, 'preferences') !== false) {
            return $rules['preferences'];
        } elseif (strpos($routeName, 'professional') !== false) {
            return $rules['professional'];
        } elseif (strpos($routeName, 'patient') !== false) {
            return $rules['patient'];
        } elseif (strpos($routeName, 'review') !== false) {
            return $rules['review'];
        }
        
        return [];
    }
    
    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'rating.required' => 'Une note est requise pour l\'évaluation.',
            'rating.min' => 'La note minimale est de 1 étoile.',
            'rating.max' => 'La note maximale est de 5 étoiles.',
            'comment.max' => 'Le commentaire ne doit pas dépasser 1000 caractères.',
            'gender.in' => 'Le genre doit être Homme, Femme, ou Autre',
            'birthdate.before' => 'La date de naissance doit être antérieure à aujourd\'hui.',
            'therapy_domains.*.exists' => 'Un ou plusieurs domaines de thérapie sélectionnés n\'existent pas.',
            'profile_image.image' => 'Le fichier doit être une image.',
            'profile_image.max' => 'L\'image ne doit pas dépasser 2Mo.',
        ];
    }
}