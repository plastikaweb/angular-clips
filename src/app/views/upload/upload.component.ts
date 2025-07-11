import { NgClass, PercentPipe } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { serverTimestamp, Timestamp } from '@angular/fire/firestore';
import {
  fromTask,
  getDownloadURL,
  ref,
  Storage,
  uploadBytesResumable,
  UploadTask,
} from '@angular/fire/storage';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuid } from 'uuid';
import { ClipService } from '../../services/clip.service';
import { AlertComponent } from '../../shared/alert/alert.component';
import { EventBlockerDirective } from '../../shared/directives/event-blocker.directive';
import { InputComponent } from '../../shared/input/input/input.component';

@Component({
  selector: 'app-upload',
  imports: [
    EventBlockerDirective,
    NgClass,
    ReactiveFormsModule,
    InputComponent,
    AlertComponent,
    PercentPipe,
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent implements OnDestroy {
  isDragOver = signal(false);
  file = signal<File | null>(null);
  nextStep = signal(false);
  showAlert = signal(false);
  alertMessage = signal('your clip is being uploaded');
  alertColor = signal('blue');
  inSubmission = signal(false);
  percentage = signal(0);
  showPercentage = signal(false);
  #auth = inject(Auth);
  #clipService = inject(ClipService);
  #router = inject(Router);

  formBuilder = inject(FormBuilder);
  #storage = inject(Storage);
  clipTask: UploadTask | null = null;

  form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
  });

  storeFile(event: Event) {
    this.isDragOver.set(false);
    const file = (event as DragEvent).dataTransfer?.files.item(0) ?? null;
    if (file?.type !== 'video/mp4') {
      alert('Please upload a video file');
      return;
    }
    this.form.controls.title.setValue(file.name.replace(/\.[^/.]+$/, ''));
    this.form.controls.title.markAsTouched();
    this.file.set(file);
    this.nextStep.set(true);
  }

  uploadFile() {
    this.showAlert.set(true);
    this.alertMessage.set('your clip is being uploaded');
    this.alertColor.set('blue');
    this.inSubmission.set(true);
    this.showPercentage.set(true);

    if (!this.file()) {
      return;
    }
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;
    const clipRef = ref(this.#storage, clipPath);
    this.clipTask = uploadBytesResumable(clipRef, this.file() as File);
    this.form.disable();

    fromTask(this.clipTask).subscribe({
      next: (snapshot) => {

        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        this.percentage.set(progress);
      },
      error: (err) => {
        this.form.enable();
        this.alertMessage.set(`upload failed`);
        this.alertColor.set('red');
        this.showPercentage.set(false);
        this.inSubmission.set(false);
        console.error(err);
      },
      complete: async () => {
        this.form.enable();
        const clipUrl = await getDownloadURL(clipRef);
        this.clipTask = null;
        const clip = {
          uid: this.#auth.currentUser?.uid as string,
          displayName: this.#auth.currentUser?.displayName as string,
          title: this.form.controls.title.value,
          fileName: `${clipFileName}.mp4`,
          clipUrl,
          timestamp: serverTimestamp() as Timestamp, 
        }

        const clipDocRef = await this.#clipService.createClip(clip);

        this.alertMessage.set('upload complete');
        this.alertColor.set('green');
        this.showPercentage.set(false);

        setTimeout(() => {
          this.#router.navigate(['/clip', clipDocRef.id]);
        }, 1000);
      },
    });
  }

  ngOnDestroy() {
    this.clipTask?.cancel();
  }
}
