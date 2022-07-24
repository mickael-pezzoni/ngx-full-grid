import { FakeUserService, PaginationParams } from './fake-user.service';
import {
  FilterEntity,
  GridParams,
  GridState,
  SortDirection,
} from './../../../ngx-full-grid/src/lib/ngx-full-grid.model';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  selectedItems: FakeUsers[] = [];
  state: GridState<FakeUsers> = {
    columns: [
      {
        name: 'First name',
        property: 'name.first',
        visible: true,
        index: 4,
      },
      {
        name: 'Last name',
        property: 'name.last',
        visible: true,
        index: 5,
      },
      {
        name: 'Username',
        property: 'login.username',
        visible: true,
        sort: { direction: SortDirection.ASC, index: 1 },
        index: 2,
      },
      {
        name: 'City',
        property: 'location.city',
        visible: true,
      },
      {
        name: 'Zip',
        property: 'location.postcode',
        visible: false,
      },
      {
        name: 'Age',
        property: 'dob.age',
        visible: true,
        index: 1,
      },
      {
        name: 'Email',
        property: 'email',
        visible: false,
        index: 3,
      },
    ],
  };

  constructor(
    private changeDetector: ChangeDetectorRef,
    private readonly fakeUserService: FakeUserService
  ) {
    this.fakeUsers$ = this.fakeUsersRequest$;
  }

  ngOnInit(): void {
    this.fakeUsers$.subscribe((res) => {
      this.data = res.results;
      this.selectedItems = [res.results[0]];
      this.changeDetector.detectChanges();
    });
  }

  isSelect(currentItem: FakeUsers, selectedItem: FakeUsers): boolean {
    return currentItem.login.uuid === selectedItem.login.uuid;
  }

  onSelectItem(items: FakeUsers[]): void {
    console.log(this.selectedItems);
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
    this.changeDetector.detectChanges();
  }

  onParamsChange(event: GridParams<FakeUsers>): void {
    console.log(event);
  }

  onStateChange(event: GridState<FakeUsers>): void {}

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
