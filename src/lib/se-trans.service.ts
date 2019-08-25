import { Injectable } from '@angular/core';
import { NavigationStart, Router } from "@angular/router";
import { filter } from "rxjs/operators";

import { SeTransDirective } from "./se-trans.directive";
import { SeTransState } from "./se-trans-state";

@Injectable()
export class SeTransService {

  private activeDirectives: SeTransDirective[] = [];

  constructor(
    private readonly config: SeTransConfig,
    private readonly router: Router,
  ) {
    const defaultConfig = new SeTransConfig();
    this.config = {...defaultConfig, ...this.config};

    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => this.onNavigateStart(event));
  }

  public registerTransitionSource(identifier: string, directive: SeTransDirective) {
    directive.weight = new Date().getTime();
  }

  public unregisterTransitionSource(directive: SeTransDirective) {
    directive.weight = 0;
  }

  public beforeChange() {
    this.activeDirectives.forEach(directive => {
      directive.updateLastRect();
      directive.updateLastTransitioningRect();
      directive.updateLeaveScrollTop();
    })
  }

  private onNavigateStart(event: NavigationStart) {
    if (event.navigationTrigger === 'popstate') {
      this.transitionPrevPage(event.url);
    }
    this.beforeChange();
    this.activeDirectives
      .filter(dir => dir.state == SeTransState.Transitioning)
      .forEach(directive => directive.stopLastTransition());
  }

  private transitionPrevPage(url: string) {
    this.activeDirectives
      .filter(dir => dir.url === this.router.url)
      .forEach(sourceDir => {
        let targetDir = this.getLastTransitionDirective(sourceDir, url);
        if (targetDir) {
          this.transitionDirective(sourceDir, targetDir, sourceDir.getRect());
        }
      });
  }

  onDirectiveInit(directive: SeTransDirective) {
    directive.url = this.router.url;
    this.activeDirectives.push(directive);

    const targetDir = directive;
    const sourceDir = this.getLastTransitionDirective(targetDir);
    const rect = sourceDir && (sourceDir.lastTransitioningRect || sourceDir.lastRect);
    this.transitionDirective(sourceDir, targetDir, rect);
  }

  onDirectiveDestroy(directive: SeTransDirective) {
    // Do in next frame.
    setTimeout(() => {
      this.activeDirectives = this.activeDirectives.filter(seDire => seDire !== directive);
    });
  }

  getLastTransitionDirective(directive: SeTransDirective, url: string = null): SeTransDirective {
    const isSameIdentifier = (dir1, dir2) => dir1.identifier == dir2.identifier;
    const isSameSrc = (dir1, dir2) => !dir1.src || !dir2.src || dir1.src == dir2.src;
    return this.activeDirectives
      .filter(dir => (!url || dir.url === url) && isSameIdentifier(dir, directive) && isSameSrc(dir, directive))
      .sort((d1, d2) => d2.weight - d1.weight)[0];
  }

  transitionDirective(sourceDir, targetDir, rect) {
    if (rect) {
      const timeSpanFromLast = new Date().getTime() - sourceDir.lastTransitioningStartTime;
      targetDir.doTransition(rect, Math.min(targetDir.seTransTime, timeSpanFromLast));
    }
  }

  getConfig(): SeTransConfig {
    return this.config;
  }
}

export class SeTransConfig {
  transTime = 500;
}
