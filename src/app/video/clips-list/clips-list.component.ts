import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { ClipService } from '../../services/clip.service';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';

@Component({
  selector: 'app-clips-list',
  imports: [RouterLink, TimestampPipe],
  templateUrl: './clips-list.component.html',
  styleUrl: './clips-list.component.css'
})
export class ClipsListComponent implements OnInit, OnDestroy {
  clipService = inject(ClipService);
  scrollable = input(true);

  constructor() {
    this.clipService.getClips();
  }

  ngOnInit(): void {
    if (this.scrollable()) {
      window.addEventListener('scroll', this.onScroll);
    }
  }

  ngOnDestroy(): void {
    if (this.scrollable()) {
      window.removeEventListener('scroll', this.onScroll);
    }

    this.clipService.pageClips.set([]);
  }

  onScroll = (event: Event) => {
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;

    const bottomOfWindow = Math.round(scrollTop) + innerHeight > offsetHeight - 150;
    
    if (bottomOfWindow) {
      this.clipService.getClips();
    }
  }
} 


