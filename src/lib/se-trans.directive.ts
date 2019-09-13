import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { SeTransService } from './se-trans.service';
import { SeRect } from './se-rect';
import { SeTransState } from './se-trans-state';
import { SeTransitionOption } from './se-trans.option';

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
  @Input() seRouteAnim = false;
  @Input() seTransitionOn: Observable<any>;
  @Input() seAutoRegister = false;

  @Output() seTransStart = new EventEmitter<SeTransitionOption>();
  @Output() seTransEnd = new EventEmitter<SeTransitionOption>();

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
  lastTransitionTime = 0;
  lastTransitionFrom: SeRect;
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

  public async doTransition(opt: SeTransitionOption): Promise<any> {
    this.state = SeTransState.AboutToTransition;
    const scrollTop = this.leaveScrollTop || this.getScrollTop();
    const fromRect = Object.assign({}, opt.from);
    const transitionTime = opt.time || this.seTime;

    const clone = this.createClone(transitionTime);
    this.hideElement();
    fromRect.top += scrollTop + this.seSourceYOffset;
    this.setPlace(clone, fromRect);
    this.lastTransitionFrom = fromRect;
    await this.waitAwhile();

    this.state = SeTransState.Transitioning;
    this.lastTransitionTime = new Date().getTime();
    const toRect = opt.to ? Object.assign({}, opt.to) : this.getBoundingRect(this.element);
    toRect.top += this.getScrollTop() + parseInt(this.seTargetYOffset, 10);
    this.setPlace(clone, toRect);
    this.seTransStart.emit({from: fromRect, to: toRect, time: transitionTime});
    this.lastTransitioningStartTime = new Date().getTime();

    await this.getTransitionEndPromise(clone);
    if (!opt.keepState) {
      this.removeCloneAndShowSource(clone);
      this.lastCloneElement = null;
      this.lastTransitioningRect = null;
      this.lastTransitioningStartTime = 0;
      this.seTransEnd.emit(opt);
    }
    return Promise.resolve();
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
    clone.style.transition = `all ${transitionTime}ms`;
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

  getTransitionEndPromise(element: HTMLElement): Promise<void> {
    return fromEvent(element, 'transitionend')
      .pipe(first(), map(() => null))
      .toPromise();
  }

  stopLastTransition() {
    if (this.state === SeTransState.Transitioning) {
      this.updateLastTransitioningRect();
    }
    if (this.lastCloneElement) {
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
