import { Injectable, signal } from '@angular/core';

interface IModal {
  id: string;
  element: HTMLDialogElement;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private modals = signal<IModal[]>([]);

  register(id: string, element: HTMLDialogElement) {
    this.modals.set([
      ...this.modals(),
      { id, element }
    ]);
  }

  toggle(id: string) {
    const modal = this.modals().find(m => m.id === id);
    if (!modal) return;
    modal.element.open ? modal.element.close() : modal.element.showModal();
  }

  unregister(id: string) {
    this.modals.set(this.modals().filter(m => m.id !== id));
  }
}
