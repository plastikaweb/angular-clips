import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-manage',
  imports: [RouterLink],
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.css'
})
export class ManageComponent implements OnInit   {
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  videoOrder = signal('1');

  ngOnInit() {
      this.#route.queryParams.subscribe(params => {
        this.videoOrder.set(params['sort'] ?? '1');
      });
  }


  sortVideos(event: Event) {
    const { value: sort } = event.target as HTMLSelectElement;
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: {
        sort
      }
    });
  }
}
