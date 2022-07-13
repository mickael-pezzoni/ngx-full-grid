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
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
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
  styles: [
    `
      :host {
        table {
          width: 100%;

          .item-selected {
            background-color: red;
          }
        }
        .example-custom-placeholder {
          background: #ccc;
          border: dotted 3px #999;
          min-height: 60px;
          transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
        }

        .cdk-drop-list-dragging .example-box:not(.cdk-drag-placeholder) {
          transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
        }

        .cdk-drag-preview {
          box-sizing: border-box;
          border-radius: 4px;
          box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
            0 8px 10px 1px rgba(0, 0, 0, 0.14),
            0 3px 14px 2px rgba(0, 0, 0, 0.12);
        }

        .cdk-drag-animating {
          transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
        }
      }
    `,
  ],
})
export class NgxFullGridComponent<T extends object> implements OnInit {
  @Input() values!: T[];
  @Input() enableFilter = false;
  @Input() enableSorting = false;
  @Input() selectedClass = 'item-selected';
  @Input() backendFilter = false;
  @Input() filterMode?: FilterMode;
  @Input() checkSelectFnt!: (currentItem: T, selectedItem: T) => boolean;
  @Input() selectedItems: T[] = [];
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

  onDropColumn(event: CdkDragDrop<ColumnIdentifier<T>[]>): void {
    const dropedColumn = event.item.data;
    const columnTarget = this.state.columns[event.currentIndex];

    this._state = {
      ...this._state,
      columns: [
        ...this.state.columns.map((column, index) => {
          if (index === event.currentIndex) {
            return { ...dropedColumn, index: event.currentIndex + 1 };
          } else if (index === event.previousIndex) {
            return { ...columnTarget, index: event.previousIndex + 1 };
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

  onSortChange(sort: GridSort<T>, propertyColumn: DotNestedKeys<T>): void {
    if (!this.ctrlIsPressed) {
      this.cleanSort();
    }
    const sortIndex = this.state.columns
      .map((column) => column.sort?.index ?? 0)
      .sort()
      .reverse()[0];

    this.state = {
      ...this.state,
      columns: [
        ...this.state.columns.map((column) => ({
          ...column,
          sort:
            column.property === propertyColumn
              ? {
                  ...sort,
                  index:
                    sortIndex < this.displayedColumns.length
                      ? sortIndex + 1
                      : sortIndex,
                }
              : column.sort,
        })),
      ],
    };
    this.emitState();
  }
}
