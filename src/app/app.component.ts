import { Component } from '@angular/core';
import { NavComponent } from './core/nav/nav.component';
import { AuthModalComponent } from './user/auth-modal/auth-modal.component';

@Component({
  selector: 'app-root',
  imports: [NavComponent, AuthModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  {

}
