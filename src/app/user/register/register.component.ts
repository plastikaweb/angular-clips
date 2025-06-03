import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../shared/alert/alert.component';
import { InputComponent } from '../../shared/input/input/input.component';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, InputComponent, AlertComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  showAlert = signal(false);
  alertColor = signal('blue');
  alertMessage = signal('Please await, your account is being created');
  inSubmission = signal(false);
  authService = inject(AuthService);

  #fb = inject(FormBuilder);

  form = this.#fb.nonNullable.group({
    name: ['', { validators: [Validators.required, Validators.minLength(3)] }],
    email: ['', { validators: [Validators.required, Validators.email] }],
    age: [18 , { validators: [Validators.required, Validators.min(18), Validators.max(120)] }],
    password: ['', {
      validators: [
        Validators.required,
        Validators.pattern(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
        )]
    }],
    confirmPassword: ['', { validators: [Validators.required] }],
    phoneNumber: ['', { validators: [Validators.required, Validators.minLength(11), Validators.maxLength(11)] }],
  });

  async register() {
    this.inSubmission.set(true);
    this.showAlert.set(true);
    this.alertMessage.set('Please await, your account is being created');
    this.alertColor.set('blue');

    try {
      await this.authService.register(this.form.getRawValue());
    } catch (error) {
      this.alertMessage.set('Something went wrong, please try again');
      this.alertColor.set('red');
      this.inSubmission.set(false);
      return;
    }

    this.alertMessage.set('Account created successfully');
    this.alertColor.set('green');
  }
}
