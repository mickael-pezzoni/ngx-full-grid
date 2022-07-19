import { FakeUserService, PaginationParams } from './fake-user.service';
import {
  FilterEntity,
  GridState,
  SortDirection,
} from './../../../ngx-full-grid/src/lib/ngx-full-grid.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Column,
  DotNestedKeys,
} from 'projects/ngx-full-grid/src/lib/ngx-full-grid.model';
import {
  BehaviorSubject,
  Subject,
  Observable,
  switchMap,
  takeUntil,
} from 'rxjs';
import { FakeUsers, FakeUsersResult } from './fake-user.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ngx-full-grid-example';
  private readonly queryParamsSubject$ = new BehaviorSubject<PaginationParams>({
    page: 1,
    results: 20,
  });

  readonly queryParams$ = this.queryParamsSubject$.asObservable();
  private readonly isDestroyed$ = new Subject();
  readonly fakeUsers$: Observable<FakeUsersResult>;

  data: FakeUsers[] = [];
  readonly dataToAdd = {
    position: 2,
    name: 'Helium',
    data: { weight: 4.0026 },
    symbol: 'He',
  };
  state: GridState<FakeUsers> = {
    columns: [
      {
        name: 'First name',
        property: 'name.first',
        visible: true,
      },
      {
        name: 'Last name',
        property: 'name.last',
        visible: true,
      },
      {
        name: 'Username',
        property: 'login.username',
        visible: true,
        sort: { direction: SortDirection.ASC, index: 1 },
        index: 2,
        width: 200,
      },
      {
        name: 'City',
        property: 'location.city',
        visible: true,
      },
      {
        name: 'Zip',
        property: 'location.postcode',
        visible: true,
      },
      {
        name: 'Age',
        property: 'dob.age',
        visible: true,
        index: 1,
        width: 400,
      },
      {
        name: 'Email',
        property: 'email',
        visible: true,
        index: 3,
      },
    ],
  };

  constructor(private readonly fakeUserService: FakeUserService) {
    this.fakeUsers$ = this.fakeUsersRequest$;
  }

  ngOnInit(): void {
    this.fakeUsersRequest$.subscribe((res) => {
      this.data = res.results;
    });
  }

  selectedItems: FakeUsers[] = [];
  isSelect(currentItem: FakeUsers, selectedItem: FakeUsers): boolean {
    return currentItem.name === selectedItem.name;
  }

  onSelectItem(items: FakeUsers[]): void {
    this.selectedItems = items;
  }

  onChange(changeColumn: Column<FakeUsers>): void {
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
    console.log(this.state);
  }

  onFilterChange(event: FilterEntity<FakeUsers>): void {
    console.log(event);
  }

  onStateChange(event: GridState<FakeUsers>): void {
    console.log('STATE ', event);
  }

  addData(): void {
    // this.data = [...this.data, this.dataToAdd];
  }

  get fakeUsersRequest$(): Observable<FakeUsersResult> {
    return this.queryParams$.pipe(
      switchMap((params) => {
        return this.fakeUserService.get$(params);
      })
    );
  }

  ngOnDestroy(): void {
    this.isDestroyed$.next(true);
    this.isDestroyed$.complete();
  }
}
