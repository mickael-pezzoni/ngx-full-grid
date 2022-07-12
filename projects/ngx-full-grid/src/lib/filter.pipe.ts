import { Pipe, PipeTransform } from '@angular/core';
import { DotNestedKeys, ObjectFromKeyOf } from './ngx-full-grid.model';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform<T>(
    values: T[],
    filter: ObjectFromKeyOf<T>,
    backendFilter = false
  ): T[] {
    if (backendFilter) {
      return values;
    }
    const filteredRecords =
      Object.values(filter).filter((value) => value !== undefined).length > 0
        ? values.filter((item) => {
            return (
              Object.entries(filter)
                .filter(([key, value]) => value !== undefined)
                .filter(([key, value]) =>
                  this.filterByObjectProperties(
                    item,
                    key as DotNestedKeys<T>,
                    value
                  )
                ).length > 0
            );
          })
        : values;

    return filteredRecords;
  }

  private filterByObjectProperties<T>(
    item: T,
    key: DotNestedKeys<T>,
    filterValue: unknown
  ): boolean {
    const keys = (key as string).split('.');
    const valueForKey = Object.entries(item).find(([key, value]) =>
      keys.includes(key)
    )?.[1];

    return typeof valueForKey === 'object'
      ? this.filterByObjectProperties(
          valueForKey,
          keys.join('.') as DotNestedKeys<T>,
          filterValue
        )
      : String(valueForKey).toLowerCase() === String(filterValue).toLowerCase();
  }
}
