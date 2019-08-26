import { AfterViewInit, Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appLifecycleHook]',
})
export class LifecycleHookDirective implements OnInit, AfterViewInit, OnDestroy {
  @Output() init = new EventEmitter<HTMLElement>();
  @Output() afterViewInit = new EventEmitter<HTMLElement>();
  @Output() destroy = new EventEmitter<HTMLElement>();

  constructor(private readonly elementRef: ElementRef) {}

  ngOnInit() {
    this.init.emit(this.elementRef.nativeElement);
  }

  ngAfterViewInit() {
    this.afterViewInit.emit(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.destroy.emit(this.elementRef.nativeElement);
  }
}
