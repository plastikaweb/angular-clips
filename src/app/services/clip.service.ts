import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, deleteDoc, doc, DocumentReference, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { Clip } from '../models/clip';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  #firestore = inject(Firestore); 
  #clipsCollection = collection(this.#firestore, 'clips');
  #auth = inject(Auth);
  storage = inject(Storage)

  async createClip(data: Clip): Promise<DocumentReference> {
    return await addDoc(this.#clipsCollection, data);
  }

  async getUserClips() {
    const q = query(this.#clipsCollection, where('uid', '==', this.#auth.currentUser?.uid));
    return await getDocs(q);
  }

  async updateClip(id: string, title: string) {
    const clipRef = doc(this.#firestore, 'clips', id);
    return await updateDoc(clipRef, {
      title,
    });
  }

  async deleteClip(clip: Clip) {
    const storageRef = ref(this.storage, `clips/${clip.fileName}`);
    await deleteObject(storageRef);
    const clipRef = doc(this.#firestore, 'clips', clip.id as string);
    await deleteDoc(clipRef);

    const screenshotRef = ref(this.storage, `screenshots/${clip.screenshotFileName}`);
    await deleteObject(screenshotRef);
  }
}