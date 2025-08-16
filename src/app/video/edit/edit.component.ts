import { NgClass } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Clip } from '../../models/clip';
import { ClipService } from '../../services/clip.service';
import { AlertComponent } from "../../shared/alert/alert.component";
import { InputComponent } from '../../shared/input/input/input.component';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-edit',
  imports: [ModalComponent, ReactiveFormsModule, InputComponent, AlertComponent, NgClass],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent {
  activeClip = input<Clip | null>(null);
  fb = inject(FormBuilder);
  showAlert = signal(false);
  alertColor = signal('blue');
  alertMsg = signal('Please wait, updating clip');
  inSubmission = signal(false);

  #clipService = inject(ClipService);

  form = this.fb.group({
    id: [''],
    title: ['', [Validators.required, Validators.minLength(3)]]
  });

  constructor() {
    effect(() => {
      this.form.controls.id.setValue(this.activeClip()?.id ?? '');
      this.form.controls.title.setValue(this.activeClip()?.title ?? '');
    }); 
  }

  async submit() {
    this.inSubmission.set(true);
    this.showAlert.set(true);
    this.alertColor.set('blue');
    this.alertMsg.set('Please wait, updating clip');

    try {
      await this.#clipService.updateClip(this.form.controls.id.value!, this.form.controls.title.value!);
    } catch (error) {
      this.inSubmission.set(false);
      this.alertColor.set('red');
      this.alertMsg.set('Something went wrong, please try again');
      return;
    }
    

    this.inSubmission.set(false);
    this.alertColor.set('green');
    this.alertMsg.set('Clip updated successfully');
  }
}
