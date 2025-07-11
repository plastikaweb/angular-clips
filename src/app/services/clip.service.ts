import { inject, Injectable } from '@angular/core';
import { addDoc, collection, DocumentReference, Firestore } from '@angular/fire/firestore';
import { Clip } from '../models/clip';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  #firestore = inject(Firestore); 
  #clipsCollection = collection(this.#firestore, 'clips');

  async createClip(data: Clip): Promise<DocumentReference> {
    return await addDoc(this.#clipsCollection, data);
  }
}
