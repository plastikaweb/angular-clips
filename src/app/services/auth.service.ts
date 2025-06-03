import { inject, Injectable, signal } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

import IUser from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  #auth = inject(Auth);
  #firestore = inject(Firestore);
  authState = signal(authState(this.#auth));

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


}
