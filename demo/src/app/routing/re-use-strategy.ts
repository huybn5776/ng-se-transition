import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {

  private handlers: { [key: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.routeConfig.data && route.routeConfig.data.reuse;
  }

  store(route: ActivatedRouteSnapshot, handler: DetachedRouteHandle) {
    if (handler) {
      const url = this.getUrl(route);
      this.handlers[url] = handler;
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const url = this.getUrl(route);
    return !!this.handlers[url];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    if (route.data && route.data.reuse) {
      return this.handlers[this.getUrl(route)];
    } else {
      return null;
    }
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    /** We only want to reuse the route if the data of the route config contains a reuse true boolean */
    let reUseUrl = false;

    if (future.routeConfig && future.routeConfig.data) {
      reUseUrl = future.routeConfig.data.reuse;
    }

    /**
     * Default reuse strategy by angular assers based on the following condition
     * @see https://github.com/angular/angular/blob/4.4.6/packages/router/src/route_reuse_strategy.ts#L67
     */
    const defaultReuse = (future.routeConfig === current.routeConfig);

    // If either of our reuseUrl and default Url are true, we want to reuse the route
    return reUseUrl || defaultReuse;
  }

  /**
   * Returns a url for the current route
   * @param route
   */
  getUrl(route: ActivatedRouteSnapshot): string {
    /** The url we are going to return */
    return route.routeConfig ? route.routeConfig.path : undefined;
  }
}
