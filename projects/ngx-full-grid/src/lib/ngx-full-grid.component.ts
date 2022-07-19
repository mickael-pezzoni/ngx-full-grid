import {
  Column,
  DotNestedKeys,
  ColumnIdentifier,
  ObjectFromKeyOf,
  FilterEntity,
  SortDirection,
  GridState,
  GridSort,
  GridStateApplied,
  FilterMode,
} from './ngx-full-grid.model';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
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
})
export class NgxFullGridComponent<T extends object> implements OnInit {
  @Input() values!: T[];
  @Input() enableFilter = false;
  @Input() enableSorting = false;
  @Input() enableReorder = false;
  @Input() enableResize = false;
  @Input() selectedClass = 'item-selected';
  @Input() backendFilter = false;
  @Input() filterMode?: FilterMode;
  @Input() checkSelectFnt!: (currentItem: T, selectedItem: T) => boolean;
  @Input() selectedItems: T[] = [];
  @ViewChild('matTable', { static: true, read: ElementRef })
  readonly matTableElement!: ElementRef<HTMLElement>;
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
  get state(): GridStateApplied<T> {
    return this._state;
  }

  @Output() filterChange = new EventEmitter<FilterEntity<T>>();
  @Output() selectChange = new EventEmitter<T[]>();
  @Output() stateChange = new EventEmitter<GridState<T>>();

  filter: FilterEntity<T> = {};

  private _state!: GridStateApplied<T>;
  private ctrlIsPressed = false;
  private shiftIsPressed = false;
  resize = false;

  constructor() {}

  ngOnInit(): void {}

  get displayedColumns(): string[] {
    return this.state.columns
      .filter((column) => column.visible)
      .map((column) => column.uuid);
  }

  getValueFromProperty(item: object, property: DotNestedKeys<T>): unknown {
    const keys = (property as string).split('.');

    const value = Object.entries(item).find(([key]) => keys.includes(key))?.[1];

    return typeof value === 'object'
      ? this.getValueFromProperty(value, keys.join('.') as DotNestedKeys<T>)
      : value;
  }

  @HostListener('document:keydown', ['$event']) private onKeyPressed(
    event: KeyboardEvent
  ): void {
    this.ctrlIsPressed = event.key === 'Control';
    this.shiftIsPressed = event.key === 'Shift';
  }

  @HostListener('document:keyup', ['$event']) private onKeyUnpressed(
    event: KeyboardEvent
  ): void {
    this.ctrlIsPressed = event.key === 'Control' ? false : this.ctrlIsPressed;
    this.shiftIsPressed = event.key === 'Shift' ? false : this.shiftIsPressed;
  }

  onRowSelect(selectedItem: T): void {
    const ilAlreadySelected = this.isSelect(selectedItem);
    if (this.ctrlIsPressed) {
      this.selectedItems = ilAlreadySelected
        ? [
            ...this.selectedItems.filter(
              (item) => !this.checkSelectFnt(item, selectedItem)
            ),
          ]
        : [...this.selectedItems, selectedItem];
    } else if (this.shiftIsPressed) {
      this.selectRange(selectedItem);
    } else if (ilAlreadySelected) {
      this.selectedItems = this.selectedItems.length > 1 ? [selectedItem] : [];
    } else {
      this.selectedItems = [selectedItem];
    }

    this.selectChange.emit(this.selectedItems);
  }

  private selectRange(selectedItem: T): void {
    if (this.selectedItems.length > 0) {
      const selectedItems = [...this.selectedItems, selectedItem];
      const largestIndex = selectedItems
        .map((item) =>
          this.values.findIndex((value) => this.checkSelectFnt(value, item))
        )
        .sort((a, b) => a + b)[0];

      const smallestIndex = selectedItems
        .map((item) =>
          this.values.findIndex((value) => this.checkSelectFnt(value, item))
        )
        .sort()[0];
      this.selectedItems = [
        ...this.values.slice(smallestIndex, largestIndex + 1),
      ];
    } else {
      this.selectedItems = [selectedItem];
    }
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
  }

  private cleanSort(): void {
    this.state = {
      ...this.state,
      columns: [
        ...this.state.columns.map((column) => ({ ...column, sort: undefined })),
      ],
    };
  }

  onResize(): void {
    this.resize = true;
  }

  onStopResize(width: number, resizedColumn: ColumnIdentifier<T>): void {
    this.resize = false;
    console.log(width);

    this._state = {
      ...this.state,
      columns: this.state.columns.map((column) => {
        if (column.uuid === column.uuid) {
          return {
            ...column,
            width: width,
          };
        }
        return column;
      }),
    };
    this.emitState();
  }

  onDropColumn(event: CdkDragDrop<ColumnIdentifier<T>[]>): void {
    const dropedColumn = event.item.data as ColumnIdentifier<T>;
    const columnTarget = this.state.columns[event.currentIndex];
    this._state = {
      ...this._state,
      columns: [
        ...this.state.columns.map((column, index) => {
          if (index === event.currentIndex) {
            return {
              ...dropedColumn,
              index: event.currentIndex + 1,
            };
          } else if (index === event.previousIndex) {
            return {
              ...columnTarget,
              index: event.previousIndex + 1,
            };
          }
          return column;
        }),
      ],
    };

    this.emitState();
  }

  private emitState(): void {
    this.stateChange.emit(this.state);
  }

  private calculSortIndex(
    sort: GridSort<T>,
    column: ColumnIdentifier<T>
  ): number {
    const sortIndex = this.state.columns
      .map((column) => column.sort?.index ?? 0)
      .sort()
      .reverse()[0];

    if (sort.index === column.sort?.index) {
      return sort.index;
    }

    if (sortIndex < this.displayedColumns.length) {
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
      const newIndex = this.calculSortIndex(sort, sortedColumn);
      this.updateSortColum(sortedColumn, { ...sort, index: newIndex });
    }

    if (sort === undefined) {
      const oldIndex = sortedColumn.sort?.index ?? 0;
      const columnsHigherSortIndex = this.state.columns.filter(
        (column) => column.sort !== undefined && column.sort.index > oldIndex
      );
      const remainingColumns = this.state.columns.filter(
        (column) =>
          !columnsHigherSortIndex.some((colSup) => column.uuid === colSup.uuid)
      );

      this._state = {
        ...this.state,
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
  }

  private updateSortColum(
    sortedColumn: ColumnIdentifier<T>,
    sort: GridSort<T> | undefined
  ): void {
    this.state = {
      ...this.state,
      columns: this.state.columns.map((column) => {
        if (!column.visible) {
          return column;
        }
        if (sortedColumn.property === column.property) {
          return {
            ...column,
            sort: sort,
          };
        }
        return column;
      }),
    };
  }
}
