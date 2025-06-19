import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavComponent } from './core/nav/nav.component';
import { AuthService } from './services/auth.service';
import { AuthModalComponent } from './user/auth-modal/auth-modal.component';

@Component({
  selector: 'app-root',
  imports: [NavComponent, AuthModalComponent, AsyncPipe, RouterOutlet],
  standalone: true,
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  {
  #auth = inject(AuthService);
  authStateWithDelay$ = this.#auth.authStateWithDelay$;
}
