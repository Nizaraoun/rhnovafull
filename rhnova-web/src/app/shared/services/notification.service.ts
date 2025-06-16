import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  showError(message: string): void {
    // Simple alert for now - you can replace this with a proper toast/notification system
    alert(`Error: ${message}`);
  }

  showWarning(message: string): void {
    console.warn(message);
    // You can implement toast notifications here
  }

  showSuccess(message: string): void {
    // You can implement toast notifications here
    console.log(message);
  }
}
