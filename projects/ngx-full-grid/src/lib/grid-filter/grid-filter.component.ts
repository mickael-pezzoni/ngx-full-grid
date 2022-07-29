import { ColumnIdentifier } from './../ngx-full-grid.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'lib-grid-filter',
  templateUrl: './grid-filter.component.html',
  styleUrls: ['./grid-filter.component.scss'],
})
export class GridFilterComponent<T extends object> implements OnInit {
  @Output() filterChange = new EventEmitter<string>();
  @Input() column!: ColumnIdentifier<T>;

  constructor() {}

  ngOnInit(): void {}

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterChange.emit(value);
  }

  cleanFilter(input: HTMLInputElement): void {
    const inputElement = input;
    inputElement.value = '';

    this.filterChange.emit('');
  }
}
