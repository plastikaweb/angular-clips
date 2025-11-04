import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Clip } from '../../models/clip';
import { ClipService } from '../../services/clip.service';
import { ModalService } from '../../services/modal.service';
import { EditComponent } from '../../video/edit/edit.component';

@Component({
  selector: 'app-manage',
  imports: [RouterLink, EditComponent],
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.css'
})
export class ManageComponent implements OnInit   {
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  videoOrder = signal('1');
  clipService = inject(ClipService);  
  clips = signal<Clip[]>([]);
  activeClip = signal<Clip | null>(null);
  #modalService = inject(ModalService);
  orderedClips = computed(() => {
    return this.clips().sort((a, b) => {
      return this.videoOrder() === '1' ? a.timestamp.toMillis() - b.timestamp.toMillis() : 
      b.timestamp.toMillis() - a.timestamp.toMillis()
    })
  })

  async ngOnInit() {
      this.#route.queryParams.subscribe(params => {
        this.videoOrder.set(params['sort'] ?? '1');
      });

      const results = await this.clipService.getUserClips();
      this.clips.set(results.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Clip)
      ));
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

  openModal(event: Event, clip: Clip) {
    event.preventDefault();
    this.activeClip.set(clip);
    this.#modalService.toggle('editClip');
  }

  updateClip(clip: Clip) {
    const currentClips = this.clips();
    currentClips.forEach((element, index) => {
      if (element.id === clip.id) {
        currentClips[index].title = clip.title;
      }
    });
    this.clips.set(currentClips);
  }

  deleteClip(event: Event, clip: Clip) {
    event.preventDefault();

    this.clipService.deleteClip(clip);

    const currentClips = this.clips();
    currentClips.forEach((element, index) => {
      if (element.id === clip.id) {
        currentClips.splice(index, 1);
      }
    });
    this.clips.set(currentClips);

  }
}
