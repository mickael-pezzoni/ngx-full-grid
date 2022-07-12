import { Pipe, PipeTransform } from '@angular/core';
import {
  DotNestedKeys,
  FilterMode,
  FILTER_MODE,
  ObjectFromKeyOf,
} from './ngx-full-grid.model';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  private readonly functionByFilterMode: {
    [key in FilterMode]: (value: string, term: string) => boolean;
  } = {
    contains: (value: string, term: string): boolean => value.includes(term),
    equals: (value: string, term: string): boolean => value === term,
    startWith: (value: string, term: string): boolean => value.startsWith(term),
  };
  transform<T>(
    values: T[],
    filter: ObjectFromKeyOf<T>,
    backendFilter = false,
    searchMode: FilterMode = 'equals'
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
                    value,
                    searchMode
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
    filterValue: unknown,
    filterMode: FilterMode
  ): boolean {
    const keys = (key as string).split('.');
    const valueForKey = Object.entries(item).find(([key, value]) =>
      keys.includes(key)
    )?.[1];

    if (typeof valueForKey === 'object') {
      return this.filterByObjectProperties(
        valueForKey,
        keys.join('.') as DotNestedKeys<T>,
        filterValue,
        filterMode
      );
    }

    return this.functionByFilterMode[filterMode](
      String(valueForKey).toLowerCase(),
      String(filterValue).toLowerCase()
    );
  }
}
