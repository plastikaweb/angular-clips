import { Component, inject } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-nav',
  imports: [],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  modalService = inject(ModalService);
  authService = inject(AuthService)

  openModal(event: Event) {
    event.preventDefault();
    this.modalService.toggle('authentication');
  }
}
