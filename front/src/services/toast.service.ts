import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() {}

  /**
   * Display a success message to the user
   * @param message The success message to show
   */
  success(message: string): void {
    console.log('Success:', message);

    this.showToast(message, 'success');
  }

  /**
   * Display an error message to the user
   * @param message The error message to show
   */
  error(message: string): void {
    console.error('Error:', message);

    this.showToast(message, 'error');
  }

  /**
   * Display a warning message to the user
   * @param message The warning message to show
   */
  warning(message: string): void {
    console.warn('Warning:', message);

    this.showToast(message, 'warning');
  }

  /**
   * Display an info message to the user
   * @param message The info message to show
   */
  info(message: string): void {
    console.info('Info:', message);

    this.showToast(message, 'info');
  }

  private showToast(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const colors = {
      success: '#6fb670',
      error: '#dd4338',
      warning: '#FF9800',
      info: '#2196F3',
    };

    console.log(
      `%c ${type.toUpperCase()}: ${message}`,
      `background: ${colors[type]}; color: white; padding: 4px; border-radius: 4px;`
    );
  }
}
