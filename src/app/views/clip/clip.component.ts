import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';

@Component({
  selector: 'app-clip',
  imports: [RouterLink],
  templateUrl: './clip.component.html',
  styleUrl: './clip.component.css'
})
export class ClipComponent implements OnInit {
  route = inject(ActivatedRoute);
  id = signal('');

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id.set(params['id']);
    });
  }
}
