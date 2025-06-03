import { AfterViewInit, Component, ElementRef, inject, input, OnDestroy, viewChild } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  imports: [],
  // providers: [ModalService],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  modalService = inject(ModalService);

  id = input.required<string>();
  dialog = viewChild.required<ElementRef<HTMLDialogElement>>('baseDialog');

  ngAfterViewInit() {
    this.modalService.register(this.id(), this.dialog().nativeElement);
  }

  ngOnDestroy() {
    this.modalService.unregister(this.id());
  }
}
