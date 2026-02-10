import { Injectable } from '@angular/core';
import { AppDirection } from './i18n.types';

@Injectable({ providedIn: 'root' })
export class DirectionService {
  private current: AppDirection = 'ltr';

  get direction(): AppDirection {
    return this.current;
  }

  setDirection(direction: AppDirection): void {
    this.current = direction;
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
    }
  }
}
