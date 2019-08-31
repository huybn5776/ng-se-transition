import { SeRect } from './se-rect';

export class SeTransitionOption {
  from: SeRect;
  to?: SeRect;
  time?: number;
  keepState?: boolean;
}
