import { environment } from '../../../environnement';

export const encryptionKey = {
  KEY: environment.encryptionKey,
  METHOD: 'AES-256-CBC',
};
