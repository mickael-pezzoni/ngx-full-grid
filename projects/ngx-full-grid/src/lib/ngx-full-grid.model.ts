type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

export type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<
          DotNestedKeys<T[K]>
        >}`;
      }[Exclude<keyof T, symbol>]
    : ''
) extends infer D
  ? Extract<D, string>
  : never;

export interface Column<T extends object> {
  name: string;
  property: DotNestedKeys<T>;
  sort?: GridSort<T>;
  index?: number;
  visible: boolean;
  width?: number;
}
export type ObjectFromKeyOf<T> = {
  [key in keyof T]?: T[key];
};

export type FilterEntity<T> = ObjectFromKeyOf<T>;

export const FILTER_MODE = ['contains', 'equals', 'startWith'] as const;
export type FilterMode = typeof FILTER_MODE[number];

export interface ColumnIdentifier<T extends object> extends Column<T> {
  uuid: string;
}
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type RangeSelectDirection = 'ASC' | 'DESC';

export interface GridSort<T> {
  direction: SortDirection;
  index: number;
}

export interface GridState<T extends object> {
  columns: Column<T>[];
}

export interface GridStateApplied<T extends object> extends GridState<T> {
  columns: ColumnIdentifier<T>[];
}

export type GridSortParam<T> = keyof T extends string
  ? `${keyof T}|${SortDirection}`
  : '';

export interface ColmunWith {}
export type GridParams<T> = {
  sorts: GridSortParam<T>[];
  columns: string[];
} & FilterEntity<T>;
