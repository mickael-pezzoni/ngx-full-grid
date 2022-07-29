import { CustomColumnComponent } from './custom-column/custom-column.component';
import {
  Column,
  PropertyOf,
  ColumnIdentifier,
  ObjectFromKeyOf,
  FilterEntity,
  SortDirection,
  GridState,
  GridSort,
  GridStateApplied,
  FilterMode,
  GridSortParam,
  GridParams,
  RangeSelectDirection,
} from './ngx-full-grid.model';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { v4 } from 'uuid';
import {
  CdkDragDrop,
  CdkDragStart,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'lib-ngx-full-grid',
  templateUrl: './ngx-full-grid.component.html',
  styleUrls: ['./ngx-full-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxFullGridComponent<T extends object> implements OnInit {
  @Input() values: T[] = [];
  @Input() enableFilter = false;
  @Input() enableSorting = false;
  @Input() enableReorder = false;
  @Input() enableResize = false;
  @Input() selectedClass = 'item-selected';
  @Input() backendFilter = false;
  @Input() selectAllRow = false;

  @Input() filterMode?: FilterMode;
  @Input() checkSelectFnt!: (currentItem: T, selectedItem: T) => boolean;
  @Input() set selectedItems(selectedItems: T[]) {
    this._selectedItems = selectedItems;
  }
  get selectedItems(): T[] {
    return this._selectedItems;
  }
  // tslint:disable-next-line: no-unsafe-any
  @Input()
  set state(state: GridState<T>) {
    this._state = {
      ...state,
      columns: state.columns
        .map((column, index) => ({
          ...column,
          uuid: v4(),
          index: column.index ?? index,
        }))
        .sort((a, b) => a.index - b.index),
    };
  }
  get state(): GridState<T> {
    return this._state;
  }

  get stateApplied(): GridStateApplied<T> {
    return this._state;
  }
  @ViewChild('matTable', { read: ElementRef, static: true })
  readonly matTableElement!: ElementRef<HTMLElement>;
  @ViewChildren('header')
  headers!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('originalCellTemplate', { static: true })
  originalCellTemplate!: TemplateRef<unknown>;
  @ContentChildren(CustomColumnComponent) customColumns!: QueryList<
    CustomColumnComponent<T>
  >;

  @Output() private readonly filterChange = new EventEmitter<FilterEntity<T>>();
  @Output() private readonly selectedItemsChange = new EventEmitter<T[]>();
  @Output() private readonly stateChange = new EventEmitter<GridState<T>>();
  @Output() private readonly paramsChange = new EventEmitter<GridParams<T>>();

  filter: FilterEntity<T> = {};
  params: GridParams<T> = {
    columns: [],
    sorts: [],
    ...this.filter,
  };
  _selectedItems: T[] = [];
  private _state!: GridStateApplied<T>;
  private ctrlIsPressed = false;
  private shiftIsPressed = false;
  minWith = 10;
  resize = false;
  rangeSelectDirection?: RangeSelectDirection;

  constructor() {}

  ngOnInit(): void {}

  get visibleColumnsUuid(): string[] {
    return this.stateApplied.columns
      .filter((column) => column.visible)
      .map((column) => column.uuid);
  }

  get visibleColumnsProperty(): string[] {
    return this.stateApplied.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  getValueFromProperty(item: object, property: PropertyOf<T>): unknown {
    const keys = (property as string).split('.');

    const value = Object.entries(item).find(([key]) => keys[0] === key)?.[1];

    return typeof value === 'object' && value !== null && value !== undefined
      ? this.getValueFromProperty(
          value as object,
          keys.slice(1).join('.') as PropertyOf<T>
        )
      : value;
  }

  hasTemplate(property: PropertyOf<T>): boolean {
    return (
      this.customColumns
        .toArray()
        .find((col) => (col.property as string) === (property as string)) !==
      undefined
    );
  }

  getCellTemplate(property: PropertyOf<T>): TemplateRef<unknown> {
    return (
      this.customColumns
        .toArray()
        .find((col) => (col.property as string) === (property as string))
        ?.cellTemplate ?? this.originalCellTemplate
    );
  }
  getHeaderTemplate(property: PropertyOf<T>): TemplateRef<unknown> | undefined {
    return this.customColumns
      .toArray()
      .find((col) => (col.property as string) === (property as string))
      ?.headerTemplate;
  }

  // tslint:disable-next-line: no-unsafe-any
  @HostListener('document:keydown', ['$event']) private onKeyPressed(
    event: KeyboardEvent
  ): void {
    this.ctrlIsPressed = event.key === 'Control';
    this.shiftIsPressed = event.key === 'Shift';
  }

  // tslint:disable-next-line: no-unsafe-any
  @HostListener('document:keyup', ['$event']) private onKeyUnpressed(
    event: KeyboardEvent
  ): void {
    this.ctrlIsPressed = event.key === 'Control' ? false : this.ctrlIsPressed;
    this.shiftIsPressed = event.key === 'Shift' ? false : this.shiftIsPressed;
  }

  onRowSelect(selectedItem: T): void {
    const iSAlreadySelected = this.isSelect(selectedItem);
    if (this.ctrlIsPressed) {
      this.selectedItems = iSAlreadySelected
        ? [
            ...this.selectedItems.filter(
              (item) => !this.checkSelectFnt(item, selectedItem)
            ),
          ]
        : [...this.selectedItems, selectedItem];
    } else if (this.shiftIsPressed) {
      this.selectRange(selectedItem);
    } else if (iSAlreadySelected) {
      this.rangeSelectDirection = undefined;
      this.selectedItems = this.selectedItems.length > 1 ? [selectedItem] : [];
    } else {
      this.rangeSelectDirection = undefined;
      this.selectedItems = [selectedItem];
    }

    this.selectedItemsChange.emit(this.selectedItems);
  }

  indexOf(itemToCompare: T): number {
    return this.values.findIndex((item) =>
      this.checkSelectFnt(item, itemToCompare)
    );
  }

  private selectRange(currentSelectedItem: T): void {
    if (this.selectedItems.length > 0) {
      const currentItemIndex = this.indexOf(currentSelectedItem);

      const sortedCurrentSelectedIndex = this.sortedCurrentSelectedIndex;

      const currentRangeSelectDirection: RangeSelectDirection =
        this.rangeSelectDirection === 'ASC'
          ? currentItemIndex >
            sortedCurrentSelectedIndex[sortedCurrentSelectedIndex.length - 1]
            ? 'DESC'
            : 'ASC'
          : currentItemIndex > sortedCurrentSelectedIndex[0]
          ? 'DESC'
          : 'ASC';
      const currentItemIsFirstElementSelected =
        this.indexOf(this.selectedItems[0]) ===
        this.indexOf(currentSelectedItem);

      if (currentItemIsFirstElementSelected) {
        this.selectedItems = [currentSelectedItem];
      } else if (currentRangeSelectDirection === 'ASC') {
        this.selectRangeAsc(currentSelectedItem);
      } else {
        this.selectRangeDesc(currentSelectedItem);
      }

      this.rangeSelectDirection = currentRangeSelectDirection;
    } else {
      this.selectedItems = [currentSelectedItem];
    }
  }

  private selectRangeAsc(currentSelectedItem: T): void {
    const currentItemIndex = this.indexOf(currentSelectedItem);
    const sortedCurrentSelectedIndex = this.sortedCurrentSelectedIndex;

    if (this.rangeSelectDirection === 'DESC') {
      this.selectedItems = [
        ...this.values.slice(
          currentItemIndex,
          sortedCurrentSelectedIndex[0] + 1
        ),
      ];
    } else {
      const largestIndex =
        sortedCurrentSelectedIndex[sortedCurrentSelectedIndex.length - 1];

      this.selectedItems = [
        ...this.values.slice(currentItemIndex, largestIndex + 1),
      ];
    }
  }

  private selectRangeDesc(currentSelectedItem: T): void {
    const currentItemIndex = this.indexOf(currentSelectedItem);
    const sortedCurrentSelectedIndex = this.sortedCurrentSelectedIndex;

    if (this.rangeSelectDirection === 'ASC') {
      this.selectedItems = [
        ...this.values.slice(
          sortedCurrentSelectedIndex[this.selectedItems.length - 1],
          currentItemIndex + 1
        ),
      ];
    } else {
      this.selectedItems = [
        ...this.values.slice(
          sortedCurrentSelectedIndex[0],
          currentItemIndex + 1
        ),
      ];
    }
  }

  private get sortedCurrentSelectedIndex(): number[] {
    return this.selectedItems
      .map((item) =>
        this.values.findIndex((value) => this.checkSelectFnt(value, item))
      )
      .sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
  }

  isSelect(currentItem: T): boolean {
    return this.selectedItems.some((item) =>
      this.checkSelectFnt(currentItem, item)
    );
  }

  onFilterChange(value: string, column: ColumnIdentifier<T>): void {
    this.filter = {
      ...this.filter,
      [column.property]: value === '' ? undefined : value,
    };
    this.filterChange.emit(this.filter);
    this.updateParams();
  }

  private cleanSort(): void {
    this._state = {
      ...this.stateApplied,
      columns: [
        ...this.stateApplied.columns.map((column) => ({
          ...column,
          sort: undefined,
        })),
      ],
    };
  }

  onResize(): void {
    this.resize = true;
  }

  onStopResize(): void {
    this.resize = false;
    const columnsElement = this.headers
      .toArray()
      .map((col) => col.nativeElement);

    const columns: ColumnIdentifier<T>[] = this.stateApplied.columns.map(
      (column) => {
        const columnElement = columnsElement.find(
          (elt) => elt.id === column.uuid
        );
        const width = columnElement?.style.width.replace('%', '');

        return {
          ...column,
          width: width !== undefined ? parseInt(width, 10) : column.width,
        };
      }
    );

    this._state = {
      ...this.stateApplied,
      columns,
    };
    this.emitState();
  }

  trackByFnt(index: number): number {
    return index;
  }

  onDropColumn(event: CdkDragDrop<ColumnIdentifier<T>[]>): void {
    const droppedColumn = event.item.data as ColumnIdentifier<T>;
    const columnTarget = this.stateApplied.columns.filter(
      (column) => column.visible
    )[event.currentIndex];
    const updateColumn = this.stateApplied.columns.map((column, index) => {
      if ((columnTarget.property as string) === (column.property as string)) {
        return {
          ...droppedColumn,
          index: column.index,
        };
      }

      if ((droppedColumn.property as string) === (column.property as string)) {
        return {
          ...columnTarget,
          index: column.index,
        };
      }

      return column;
    });

    this._state = {
      ...this.stateApplied,
      columns: [...updateColumn],
    };

    this.emitState();
  }

  private emitState(): void {
    this.stateChange.emit(this.stateApplied);
  }

  private updateParams(): void {
    this.params = {
      ...this.filter,
      sorts: this.gridSortParam,
      columns: this.visibleColumnsProperty,
    };
    this.paramsChange.emit(this.params);
  }

  private calcsSortIndex(
    sort: GridSort<T>,
    sortedColumns: ColumnIdentifier<T>
  ): number {
    const sortIndex = this.stateApplied.columns
      .map((column) => column.sort?.index ?? 0)
      .sort()
      .reverse()[0];

    const sortHasActive = this.stateApplied.columns.some(
      (column) => column.sort !== undefined
    );

    if (sort.index === sortedColumns.sort?.index && sortHasActive) {
      return sort.index;
    }

    if (sortIndex < this.visibleColumnsUuid.length) {
      return sortIndex + 1;
    }

    return sortIndex;
  }

  onSortChange(
    sort: GridSort<T> | undefined,
    sortedColumn: ColumnIdentifier<T>
  ): void {
    if (!this.ctrlIsPressed) {
      this.cleanSort();
    }
    if (sort !== undefined) {
      const newIndex = this.calcsSortIndex(sort, sortedColumn);
      this.updateSortColum(sortedColumn, { ...sort, index: newIndex });
    }

    if (sort === undefined) {
      const oldIndex = sortedColumn.sort?.index ?? 0;
      const columnsHigherSortIndex = this.stateApplied.columns.filter(
        (column) => column.sort !== undefined && column.sort.index > oldIndex
      );
      const remainingColumns = this.stateApplied.columns.filter(
        (column) =>
          !columnsHigherSortIndex.some((colSup) => column.uuid === colSup.uuid)
      );

      this._state = {
        ...this.stateApplied,
        columns: [
          ...remainingColumns,
          ...columnsHigherSortIndex.map((column) => ({
            ...column,
            sort:
              column.sort !== undefined
                ? {
                    ...column.sort,
                    index: column.sort.index - 1,
                  }
                : undefined,
          })),
        ],
      };

      this.updateSortColum(sortedColumn, undefined);
    }
    this.emitState();
    this.updateParams();
  }

  get gridSortParam(): GridSortParam<T>[] {
    return this.stateApplied.columns
      .filter((column) => column.sort !== undefined)
      .sort(
        (a, b) => (a.sort as GridSort<T>).index - (b.sort as GridSort<T>).index
      )
      .map(
        (column) =>
          `${String(column.property)}|${
            (column.sort as GridSort<T>).direction
          }` as GridSortParam<T>
      );
  }

  private updateSortColum(
    sortedColumn: ColumnIdentifier<T>,
    sort: GridSort<T> | undefined
  ): void {
    this._state = {
      ...this.stateApplied,
      columns: this.stateApplied.columns.map((column) => {
        if (!column.visible) {
          return column;
        }
        if ((sortedColumn.property as string) === (column.property as string)) {
          return {
            ...column,
            sort,
          };
        }

        return column;
      }),
    };
  }
}
