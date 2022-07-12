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
  visible: boolean;
}
export type ObjectFromKeyOf<T> = {
  [key in keyof T]?: T[key];
};

export type FilterEntity<T> = ObjectFromKeyOf<T>;

export interface ColumnIdentifier<T extends object> extends Column<T> {
  uuid: string;
}
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

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
