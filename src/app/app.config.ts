import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyCMv4EOQVrbrkV9WcL3G6WPRNPimpcNhQI",
      authDomain: "clips-794e5.firebaseapp.com",
      projectId: "clips-794e5",
      storageBucket: "clips-794e5.firebasestorage.app",
      messagingSenderId: "757167254892",
      appId: "1:757167254892:web:190711e883cbc9bcd55749"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

  ]
};
