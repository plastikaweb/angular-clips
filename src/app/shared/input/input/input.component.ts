import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  imports: [ReactiveFormsModule, NgxMaskDirective],
  providers: [provideNgxMask()],
})
export class InputComponent {
  control = input.required<FormControl>();
  type = input('text');
  placeholder = input('');
  format = input('');
}
