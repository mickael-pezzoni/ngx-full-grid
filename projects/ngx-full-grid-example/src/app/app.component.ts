import {
  FilterEntity,
  GridState,
  SortDirection,
} from './../../../ngx-full-grid/src/lib/ngx-full-grid.model';
import { Component } from '@angular/core';
import {
  Column,
  DotNestedKeys,
} from 'projects/ngx-full-grid/src/lib/ngx-full-grid.model';

export interface PeriodicElement {
  name: string;
  position: number;
  data: {
    weight: number;
  };
  symbol: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ngx-full-grid-example';

  data: PeriodicElement[] = [
    { position: 1, name: 'Hydrogen', data: { weight: 1.0079 }, symbol: 'H' },
    { position: 3, name: 'Lithium', data: { weight: 6.941 }, symbol: 'Li' },
    { position: 2, name: 'Helium', data: { weight: 4.0026 }, symbol: 'He' },
    { position: 4, name: 'Beryllium', data: { weight: 9.0122 }, symbol: 'Be' },
    { position: 5, name: 'Boron', data: { weight: 10.811 }, symbol: 'B' },
    { position: 6, name: 'Carbon', data: { weight: 12.0107 }, symbol: 'C' },
    { position: 7, name: 'Nitrogen', data: { weight: 14.0067 }, symbol: 'N' },
    { position: 8, name: 'Oxygen', data: { weight: 15.9994 }, symbol: 'O' },
    { position: 9, name: 'Fluorine', data: { weight: 18.9984 }, symbol: 'F' },
    { position: 10, name: 'Neon', data: { weight: 20.1797 }, symbol: 'Ne' },
  ];

  readonly dataToAdd = {
    position: 2,
    name: 'Helium',
    data: { weight: 4.0026 },
    symbol: 'He',
  };
  state: GridState<PeriodicElement> = {
    columns: [
      {
        name: 'position',
        property: 'position',
        visible: true,
        sort: { direction: SortDirection.ASC, index: 1 },
        index: 2,
      },
      {
        name: 'weight',
        property: 'data.weight',
        visible: true,
        index: 1,
      },
      {
        name: 'symbol',
        property: 'symbol',
        visible: true,
        index: 3,
      },
    ],
  };

  constructor() {}

  selectedItems: PeriodicElement[] = [
    { position: 2, name: 'Helium', data: { weight: 4.0026 }, symbol: 'He' },
    { position: 3, name: 'Lithium', data: { weight: 6.941 }, symbol: 'Li' },
    { position: 4, name: 'Beryllium', data: { weight: 9.0122 }, symbol: 'Be' },
  ];
  isSelect(
    currentItem: PeriodicElement,
    selectedItem: PeriodicElement
  ): boolean {
    return currentItem.name === selectedItem.name;
  }

  onSelectItem(items: PeriodicElement[]): void {
    this.selectedItems = items;
  }

  onChange(changeColumn: Column<PeriodicElement>): void {
    this.state = {
      ...this.state,
      columns: [
        ...this.state.columns.map((column) => ({
          ...column,
          visible:
            column.name === changeColumn.name
              ? !column.visible
              : column.visible,
        })),
      ],
    };
  }

  onFilterChange(event: FilterEntity<PeriodicElement>): void {
    console.log(event);
  }

  onStateChange(event: GridState<PeriodicElement>): void {
    console.log('STATE ', event);
  }

  addData(): void {
    this.data = [...this.data, this.dataToAdd];
  }
}
