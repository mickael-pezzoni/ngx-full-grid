import { Pipe, PipeTransform } from '@angular/core';

import { PropertyOf } from './ngx-full-grid.model';

@Pipe({
  name: 'valueFromProperty'
})
export class ValueFromPropertyPipe implements PipeTransform {

  transform<T extends object>(item: T, property?: PropertyOf<T>): unknown {
    if (property !== undefined) {
      const keys = (property as string).split('.');

      const value = Object.entries(item).find(([key]) => keys[0] === key)?.[1];

      return typeof value === 'object' && value !== null && value !== undefined
        ? this.transform(value, keys.slice(1).join('.') as PropertyOf<T>)
        : value;
    }

    return undefined;
  }

}
