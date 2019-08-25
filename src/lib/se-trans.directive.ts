import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { fromEvent, Subscription } from "rxjs";
import { first, map } from "rxjs/operators";

import { SeTransService } from "./se-trans.service";
import { SeRect } from "./se-rect";
import { SeTransState } from "./se-trans-state";

@Directive({
  selector: '[seTrans]',
  exportAs: 'seTrans'
})
export class SeTransDirective implements AfterViewInit, OnDestroy {

  @Input() seTrans: string;
  @Input() seTransContainer: HTMLElement;
  @Input() seTransTime: number;
  @Input() seScrollContent: HTMLElement = document.body;

  @Output() seTransStart = new EventEmitter<{ from: SeRect, to: SeRect }>();
  @Output() seTransEnd = new EventEmitter<TransitionEvent>();

  get identifier() {
    return this.seTrans;
  }

  get src() {
    return this.element.getAttribute('src');
  }

  state: SeTransState = SeTransState.None;
  lastCloneElement: HTMLElement;
  transitionEndSubscription: Subscription;
  lastRect: SeRect;
  lastTransitioningRect: SeRect;
  lastTransitioningStartTime = 0;
  url: string;
  weight = 0;
  leaveScrollTop = 0;

  get element(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  get containerElement(): HTMLElement {
    return this.seTransContainer || this.element.parentElement;
  }

  constructor(
    private readonly seTransService: SeTransService,
    private readonly elementRef: ElementRef,
  ) {
    this.seTransTime = this.seTransTime || seTransService.getConfig().transTime;
  }

  async ngAfterViewInit() {
    this.seTransService.onDirectiveInit(this);
  }

  ngOnDestroy() {
    this.seTransService.onDirectiveDestroy(this);
    if (this.transitionEndSubscription) {
      this.transitionEndSubscription.unsubscribe();
    }
    this.seTransService.unregisterTransitionSource(this);
  }

  public async doTransition(sourceRect: SeRect, time: number = 0) {
    this.state = SeTransState.AboutToTransition;
    const scrollTop = this.leaveScrollTop || this.getScrollTop();

    const clone = this.createClone(time);
    this.element.style.visibility = 'hidden';
    sourceRect.top += scrollTop;
    this.setPlace(clone, sourceRect);
    await this.waitAwhile();

    this.state = SeTransState.Transitioning;
    const rect = this.getBoundingRect(this.element);
    rect.top += this.getScrollTop();
    this.seTransStart.emit({from: sourceRect, to: rect});

    this.setPlace(clone, rect);
    this.removeOnTransitionEnd(clone);
    this.lastTransitioningStartTime = new Date().getTime();
  }

  public getRect(): SeRect {
    return this.isTransitioning() ?
      this.getTransitioningRect() :
      this.getBoundingRect(this.element);
  }

  private getBoundingRect(element: HTMLElement) {
    const boundingRect = element.getBoundingClientRect();
    const rect: SeRect = {
      left: boundingRect.left,
      top: boundingRect.top,
      width: boundingRect.width,
      height: boundingRect.height,
    };
    this.lastRect = rect;
    return rect;
  }

  getScrollTop() {
    return this.seScrollContent == null ? 0 : this.seScrollContent.scrollTop;
  }

  public updateLastRect() {
    this.getBoundingRect(this.element);
  }

  public updateLastTransitioningRect() {
    if (this.isTransitioning()) {
      this.getTransitioningRect();
    }
  }

  public updateLeaveScrollTop() {
    this.leaveScrollTop = this.getScrollTop();
  }

  waitAwhile(timeout = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  createClone(transitionTime: number): HTMLElement {
    this.stopLastTransition();
    const clone: HTMLElement = this.element.cloneNode() as any;
    clone.style.position = 'absolute';
    clone.style.transition = `all ${transitionTime || this.seTransTime}ms`;
    clone.classList.add('transition-clone');
    this.containerElement.append(clone);
    this.lastCloneElement = clone;
    return clone;
  }

  setPlace(element: HTMLElement, rect: SeRect) {
    Object.assign(element.style, rect);
  }

  removeOnTransitionEnd(element: HTMLElement): Promise<boolean> {
    const subject = fromEvent(element, "transitionend")
      .pipe(first());
    this.transitionEndSubscription =
      subject.subscribe((event: TransitionEvent) => {
        this.removeCloneAndShowSource(element);
        this.lastCloneElement = null;
        this.lastTransitioningRect = null;
        this.lastTransitioningStartTime = 0;
        this.seTransEnd.emit(event);
      });
    return subject.pipe(map(() => true)).toPromise();
  }

  stopLastTransition() {
    if (this.lastCloneElement) {
      this.updateLastTransitioningRect();
      this.removeCloneAndShowSource(this.lastCloneElement);
    }
  }

  isTransitioning() {
    return !!this.lastCloneElement;
  }

  getTransitioningRect(): SeRect {
    const rect = this.getBoundingRect(this.lastCloneElement);
    this.lastTransitioningRect = rect;
    return rect;
  }

  removeCloneAndShowSource(clone: HTMLElement) {
    this.element.style.visibility = '';
    this.containerElement.removeChild(clone);
    this.lastCloneElement = null;
    this.state = SeTransState.None;
  }
}
