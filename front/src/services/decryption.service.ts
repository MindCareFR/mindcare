import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { encryptionKey } from '../app/config/encryption.config';

@Injectable({
  providedIn: 'root'
})
export class DecryptionService {
  private readonly key: string = encryptionKey.KEY;

  constructor() {}

  decryptData(encryptedData: string | null): string | null {
    if (!encryptedData) return null;

    // Si ce n'est pas du base64 valide, retourner tel quel
    if (!/^[A-Za-z0-9+/=]+$/.test(encryptedData)) {
      return encryptedData;
    }

    try {
      // Convertir la clé en format compatible CryptoJS
      const keyBytes = CryptoJS.enc.Utf8.parse(this.key);

      // Décoder base64
      const ciphertextWA = CryptoJS.enc.Base64.parse(encryptedData);

      // Taille de l'IV (16 bytes pour AES-256-CBC)
      const ivSize = 16;

      // Extraire l'IV (premiers 16 bytes)
      const iv = CryptoJS.lib.WordArray.create(
        ciphertextWA.words.slice(0, ivSize / 4),
        ivSize
      );

      // Extraire le texte chiffré (tout le reste)
      const ciphertext = CryptoJS.lib.WordArray.create(
        ciphertextWA.words.slice(ivSize / 4),
        ciphertextWA.sigBytes - ivSize
      );

      // Créer l'objet CipherParams
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext
      });

      // Déchiffrer
      const decrypted = CryptoJS.AES.decrypt(
        cipherParams,
        keyBytes,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        return encryptedData;
      }

      return decryptedText;
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      return encryptedData;
    }
  }

  decryptObject(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    // Clone profond pour éviter de modifier l'original
    const result = JSON.parse(JSON.stringify(obj));

    // Liste des champs à déchiffrer
    const fieldsToDecrypt = [
      'company_name', 'medical_identification_number',
      'company_identification_number', 'biography',
      'certification', 'firstname', 'lastname',
      'email', 'phone', 'address', 'zipcode',
      'city', 'country'
    ];

    // Parcourir tous les champs de l'objet
    for (const key in result) {
      // Si c'est un sous-objet, traiter récursivement
      if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = this.decryptObject(result[key]);
      }
      // Si c'est un champ à déchiffrer, le déchiffrer
      else if (fieldsToDecrypt.includes(key) && typeof result[key] === 'string') {
        result[key] = this.decryptData(result[key]);
      }
    }

    return result;
  }
}
