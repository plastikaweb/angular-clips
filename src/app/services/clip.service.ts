import { inject, Injectable, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, deleteDoc, doc, DocumentReference, Firestore, getDocs, query, updateDoc, where, orderBy, limit, QueryConstraint, startAfter, QueryDocumentSnapshot, getDoc } from '@angular/fire/firestore';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { Clip } from '../models/clip';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  #firestore = inject(Firestore); 
  router = inject(Router);
  #clipsCollection = collection(this.#firestore, 'clips');
  #auth = inject(Auth);
  storage = inject(Storage);
  pageClips = signal<Clip[]>([]);
  lastDoc: QueryDocumentSnapshot | null = null;
  pendingReq = false;

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

  async getClips() {
    if (this.pendingReq) {
      return;
    }

    this.pendingReq = true;

    const queryParams : QueryConstraint[] = [
      orderBy('timestamp', 'desc'),
      limit(6),
    ];

    if (this.pageClips().length) {
      queryParams.push(
        startAfter(this.lastDoc)
      )
    }

    const q = query(this.#clipsCollection, ...queryParams);   
    const snapshots = await getDocs(q);
    this.pendingReq = false;
    
    if (!snapshots.docs.length) {
      return;
    }

    this.lastDoc = snapshots.docs[snapshots.docs.length -1];

    snapshots.forEach(doc => {
      this.pageClips.set([
        ...this.pageClips(),
        {
          id: doc.id,
          ...doc.data()
        } as Clip
      ]);
    });

    }

    async resolve(id: string) {
      const snapshot = await getDoc(doc(this.#firestore, 'clips', id));

      if (!snapshot.exists()) {
        this.router.navigate(['/']);
        return null;
      }

      return snapshot.data() as Clip;
    }
 }