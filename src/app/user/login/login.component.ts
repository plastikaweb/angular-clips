import { Component, inject, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';

import { AlertComponent } from '../../shared/alert/alert.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, AlertComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  #auth = inject(Auth);

  credentials = {
    email: '',
    password: ''
  }

  showAlert = signal(false);
  alertColor = signal('blue');
  alertMessage = signal('Please await...');
  inSubmission = signal(false);

  async login() {
    try {
      this.showAlert.set(true);
      this.alertMessage.set('Please await...');
      this.alertColor.set('blue');
      this.inSubmission.set(true);

      await signInWithEmailAndPassword(
        this.#auth,
        this.credentials.email,
        this.credentials.password
      );
    } catch (error) {
      this.showAlert.set(true);
      this.alertMessage.set('Something went wrong, please try again');
      this.alertColor.set('red');
      this.inSubmission.set(false);
      return;
    }

    this.alertMessage.set('Login successful');
    this.alertColor.set('green');
  }
}
