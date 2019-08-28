import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { SeTransService } from './se-trans.service';
import { SeRect } from './se-rect';
import { SeTransState } from './se-trans-state';

@Directive({
  selector: '[seTrans]',
  exportAs: 'seTrans',
})
export class SeTransDirective implements AfterViewInit, OnDestroy {

  @Input() seTrans: string;
  @Input() seTime: number;
  @Input() seContainer: HTMLElement;
  @Input() seScrollContent: HTMLElement = document.body;
  @Input() seSourceYOffset = 0;
  @Input() seTargetYOffset: any = 0;
  @Input() seTransitionOn: Observable<any>;
  @Input() seAutoRegister = false;

  @Output() seTransStart = new EventEmitter<{ from: SeRect, to: SeRect }>();
  @Output() seTransEnd = new EventEmitter<TransitionEvent>();

  get identifier() {
    return this.seTrans;
  }

  get src() {
    return this.element.getAttribute('src');
  }

  state: SeTransState = SeTransState.None;
  transitionEnabled = false;
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
    return this.seContainer || this.element.parentElement;
  }

  constructor(
    private readonly seTransService: SeTransService,
    private readonly elementRef: ElementRef,
  ) {
    this.seTime = this.seTime || seTransService.getConfig().transTime;
  }

  ngAfterViewInit() {
    this.seTransService.onDirectiveInit(this);
  }

  ngOnDestroy() {
    this.seTransService.onDirectiveDestroy(this);
    if (this.transitionEndSubscription) {
      this.transitionEndSubscription.unsubscribe();
    }
  }

  public async doTransition(sourceRect: SeRect, time: number = 0) {
    this.state = SeTransState.AboutToTransition;
    const scrollTop = this.leaveScrollTop || this.getScrollTop();

    const clone = this.createClone(time);
    this.hideElement();
    sourceRect.top += scrollTop + this.seSourceYOffset;
    this.setPlace(clone, sourceRect);
    await this.waitAwhile();

    this.state = SeTransState.Transitioning;
    const rect = this.getBoundingRect(this.element);
    rect.top += this.getScrollTop() + parseInt(this.seTargetYOffset, 10);
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

  public updateInfo() {
    this.updateLastRect();
    this.updateLastTransitioningRect();
    this.updateLeaveScrollTop();
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

  public hideElement() {
    this.element.style.visibility = 'hidden';
  }

  public showElement() {
    this.element.style.visibility = 'visible';
  }

  public getScrollTop() {
    return this.seScrollContent == null ? 0 : this.seScrollContent.scrollTop;
  }

  waitAwhile(timeout = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  createClone(transitionTime: number): HTMLElement {
    this.stopLastTransition();
    const clone: HTMLElement = this.element.cloneNode() as any;
    clone.style.visibility = clone.style.visibility === 'hidden' ? '' : clone.style.visibility;
    clone.style.position = 'absolute';
    clone.style.transition = `all ${transitionTime || this.seTime}ms`;
    clone.style.zIndex = this.seTransService.getConfig().transZIndex + '';
    clone.classList.add('transition-clone');
    this.containerElement.append(clone);
    this.lastCloneElement = clone;
    return clone;
  }

  setPlace(element: HTMLElement, rect: SeRect) {
    element.style.top = rect.top + 'px';
    element.style.left = rect.left + 'px';
    element.style.width = rect.width + 'px';
    element.style.height = rect.height + 'px';
  }

  removeOnTransitionEnd(element: HTMLElement): Promise<boolean> {
    const subject = fromEvent(element, 'transitionend')
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
    this.showElement();
    this.containerElement.removeChild(clone);
    this.lastCloneElement = null;
    this.state = SeTransState.None;
    this.transitionEnabled = false;
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
}
