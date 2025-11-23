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
import { FfmpegService } from '../../services/ffmpeg.service';
import { combineLatestWith, forkJoin } from 'rxjs';
import { fork } from 'child_process';

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
  ffmpeg = inject(FfmpegService);
  formBuilder = inject(FormBuilder);
  #storage = inject(Storage);
  clipTask: UploadTask | null = null;
  screenshots = signal<string[]>([]);
  selectedScreenshot = signal('');
  screenshotTask?: UploadTask;

  form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor() {
    this.ffmpeg.init();
  }

  async storeFile(event: Event) {
    if (this.ffmpeg.isRunning()) {
      alert('Please wait for the previous upload to complete');
      return;
    }
    this.isDragOver.set(false);
    const file = (event as DragEvent).dataTransfer?.files.item(0) ?? null;
    if (file?.type !== 'video/mp4') {
      alert('Please upload a video file');
      return;
    }
    const screenshots = await this.ffmpeg.getScreenshots(file);
    this.screenshots.set(screenshots);
    this.selectedScreenshot.set(screenshots[0]);

    this.form.controls.title.setValue(file.name.replace(/\.[^/.]+$/, ''));
    this.form.controls.title.markAsTouched();
    this.file.set(file);
    this.nextStep.set(true);
  }

  async uploadFile() {
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
    const screenshotBlob = await this.ffmpeg.blobFromUrl(this.selectedScreenshot());
    const screenshotPath = `screenshots/${clipFileName}.png`;
    const clipRef = ref(this.#storage, clipPath);
    this.clipTask = uploadBytesResumable(clipRef, this.file() as File);

    const screenshotRef = ref(this.#storage, screenshotPath);
    this.screenshotTask = uploadBytesResumable(screenshotRef, screenshotBlob);

    this.form.disable();

    fromTask(this.clipTask).pipe(
      combineLatestWith(fromTask(this.screenshotTask))
    ).subscribe({
      next: ([clipSnapshot, screenshotSnapshot ]) => {
        this.form.disable();
        const bytesUploaded = clipSnapshot.bytesTransferred + screenshotSnapshot.bytesTransferred;
        const totalBytes = clipSnapshot.totalBytes + screenshotSnapshot.totalBytes;

        this.percentage.set(bytesUploaded / totalBytes);
      },
      
    });

    forkJoin(fromTask(this.clipTask), fromTask(this.screenshotTask)).subscribe({
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
        const screenshotUrl = await getDownloadURL(screenshotRef);
        this.clipTask = null;

        const clip = {
          uid: this.#auth.currentUser?.uid as string,
          displayName: this.#auth.currentUser?.displayName as string,
          title: this.form.controls.title.value,
          fileName: `${clipFileName}.mp4`,
          clipUrl,
          screenshotUrl,
          screenshotFileName: `${clipFileName}.png`,
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
