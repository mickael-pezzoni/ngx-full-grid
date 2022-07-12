import {
  ColumnIdentifier,
  GridSort,
  SortDirection,
} from './../ngx-full-grid.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'lib-grid-column',
  templateUrl: './grid-column.component.html',
  styleUrls: ['./grid-column.component.css'],
})
export class GridColumnComponent<T extends object> implements OnInit {
  @Input() column!: ColumnIdentifier<T>;
  @Input() enableSorting = false;
  @Input() enableFilter = false;
  @Output() filterChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<GridSort<T>>();
  constructor() {}

  ngOnInit(): void {}

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterChange.emit(value);
  }

  get isSortDesc(): boolean {
    return this.column.sort?.direction === SortDirection.DESC ?? false;
  }

  get isSortAsc(): boolean {
    return this.column.sort?.direction === SortDirection.ASC ?? false;
  }

  onSortChange(): void {
    const direction = this.isSortAsc ? SortDirection.DESC : SortDirection.ASC;

    this.sortChange.emit({
      index: this.column.sort?.index ?? 0,
      direction,
    });
  }
}
