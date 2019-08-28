import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

import photos from '../photos';
import { SeTransService } from "../../../../src/lib/se-trans.service";

@Component({
  selector: 'app-photo-gallery',
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.scss'],
  animations: [
    trigger('backdropAnim', [
      transition(':enter', [
        style({opacity: 0}),
        animate('300ms', style({opacity: 1})),
      ]),
      transition(':leave', [
        animate('300ms', style({opacity: 0}))
      ])
    ]),
  ],
})
export class PhotoGalleryComponent implements OnInit {
  photos: string[] = photos;
  selectedPhoto: string;

  constructor(
    private readonly seTransService: SeTransService,
  ) { }

  ngOnInit() {
  }

  onPhotoClick(url: string) {
    this.selectedPhoto = url;
    this.seTransService.registerAllTransition();
  }

  exitFullscreen() {
    this.selectedPhoto = null;
    this.seTransService.registerAllTransition();
  }

  applyCoverSize(element: HTMLElement, containerEl: HTMLElement) {
    const imgEl = <HTMLImageElement>element;
    const heightProportion = containerEl.offsetHeight / imgEl.naturalHeight;
    const widthProportion = containerEl.offsetWidth / imgEl.naturalWidth;
    const scale = Math.min(heightProportion, widthProportion);

    imgEl.style.width = imgEl.naturalWidth * scale + 'px';
    imgEl.style.height = imgEl.naturalHeight * scale + 'px';
  }
}
