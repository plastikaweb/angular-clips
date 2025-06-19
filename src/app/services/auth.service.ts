
import { delay, filter, map } from 'rxjs';

import { inject, Injectable } from '@angular/core';
import {
  Auth, authState, createUserWithEmailAndPassword, signOut, updateProfile
} from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import IUser from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  #auth = inject(Auth);
  #firestore = inject(Firestore);
  #router = inject(Router);
  #activatedRoute = inject(ActivatedRoute);

  authState$ = authState(this.#auth);
  authStateWithDelay$ = this.authState$.pipe(delay(1000));

  redirect = false;

  constructor() {
    this.#router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => {
        let currentRoute = this.#activatedRoute;
        while (currentRoute.firstChild) {
          currentRoute = currentRoute.firstChild;
        }
        return currentRoute;
      })
    ).subscribe(route => {
      this.redirect = route.snapshot.data['authOnly'] ?? false;
    });

  }


  async register(userData: IUser) {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        this.#auth,
        userData.email,
        userData.password
      );
      console.log(userCredentials.user.uid);
      await setDoc(doc(this.#firestore, 'users', userCredentials.user.uid), {
        name: userData.name,
        email: userData.email,
        age: userData.age,
        phoneNumber: userData.phoneNumber,
      });

      await updateProfile(userCredentials.user, {
        displayName: userData.name,
      });

    } catch (error) {
      return;
    }
  }

  async logout($event?: Event) {
    $event?.preventDefault();
    await signOut(this.#auth);

    if (this.redirect) {
    await this.#router.navigateByUrl('/');
    }
  }
}
