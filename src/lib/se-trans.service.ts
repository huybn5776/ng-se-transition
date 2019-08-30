import { Injectable, Optional } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter, first } from 'rxjs/operators';

import { SeTransDirective } from './se-trans.directive';
import { SeTransState } from './se-trans-state';
import { SeTransConfig } from './se-trans-config';
import { SeRect } from './se-rect';

@Injectable({
  providedIn: 'root',
})
export class SeTransService {

  private activeDirectives: SeTransDirective[] = [];

  constructor(
    @Optional() private readonly config: SeTransConfig,
    private readonly router: Router,
  ) {
    const defaultConfig = new SeTransConfig();
    this.config = {...defaultConfig, ...this.config};

    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => this.onNavigateStart(event));
  }

  public registerTransitionSource(directive: SeTransDirective) {
    this.registerTransition(directive, new Date().getTime());
  }

  public registerTransitionOf(identifier: string, src: string) {
    this.activeDirectives
      .filter(dir => dir.identifier === identifier && dir.src === src)
      .forEach(dir => this.registerTransition(dir, new Date().getTime()));
  }

  public registerAllTransition() {
    this.activeDirectives.forEach(directive => this.registerTransition(directive));
  }

  registerTransition(directive: SeTransDirective, weight = null) {
    directive.weight = weight == null ? directive.weight : weight;
    directive.transitionEnabled = true;
    directive.updateInfo();
  }

  onNavigateStart(event: NavigationStart) {
    if (event.navigationTrigger === 'popstate') {
      this.transitionPrevPage(event.url);
    }
    this.registerAllTransition();
    this.activeDirectives
      .filter(dir => dir.state === SeTransState.Transitioning)
      .forEach(directive => directive.stopLastTransition());
  }

  transitionPrevPage(url: string) {
    this.activeDirectives
      .filter(dir => dir.url === this.router.url)
      .forEach(sourceDir => {
        const targetDir = this.getLastTransitionDirective(sourceDir, url);
        if (targetDir) {
          this.transitionDirective(sourceDir, targetDir, sourceDir.getRect());
        }
      });
  }

  async onDirectiveInit(directive: SeTransDirective) {
    directive.url = this.router.url;
    this.activeDirectives.push(directive);

    const targetDir = directive;
    const sourceDir = this.getLastTransitionDirective(directive);
    if (!sourceDir || !sourceDir.transitionEnabled) {
      return;
    }
    if (targetDir.seTransitionOn) {
      targetDir.hideElement();
      await targetDir.seTransitionOn.pipe(first()).toPromise();
    }
    const rect = sourceDir.lastTransitioningRect || sourceDir.lastRect;
    this.transitionDirective(sourceDir, targetDir, rect);
    sourceDir.transitionEnabled = false;
  }

  onDirectiveDestroy(directive: SeTransDirective) {
    if (directive.transitionEnabled) {
      const targetDir = this.activeDirectives
        .filter(dir => dir.state !== SeTransState.AboutToTransition &&
          dir !== directive && dir.identifier === directive.identifier && dir.src === directive.src)[0];
      if (targetDir) {
        targetDir.doTransition({from: directive.lastRect});
      }
    }
    // Do in next frame.
    setTimeout(() => {
      this.activeDirectives = this.activeDirectives.filter(seDire => seDire !== directive);
    });
  }

  getLastTransitionDirective(directive: SeTransDirective, url: string = null): SeTransDirective {
    const isSameIdentifier = (dir1, dir2) => dir1.identifier === dir2.identifier;
    const isSameSrc = (dir1, dir2) => !dir1.src || !dir2.src || dir1.src === dir2.src;
    return this.activeDirectives
      .filter(dir => dir !== directive && (!url || dir.url === url) && isSameIdentifier(dir, directive) && isSameSrc(dir, directive))
      .sort((d1, d2) => d2.weight - d1.weight)[0];
  }

  transitionDirective(sourceDir: SeTransDirective, targetDir: SeTransDirective, rect: SeRect) {
    if (!rect) {
      return;
    }
    const timeSpanFromLast = new Date().getTime() - sourceDir.lastTransitioningStartTime;
    targetDir.doTransition({from: rect, time: Math.min(targetDir.seTime, timeSpanFromLast)});
    sourceDir.state = SeTransState.None;
  }

  getConfig(): SeTransConfig {
    return this.config;
  }
}

// take it if you want
// noinspection JSUnusedLocalSymbols
function n<T>(someObject: T, defaultValue: T = {} as T): T {
  return typeof someObject === 'undefined' || someObject === null ? defaultValue : someObject;
}
