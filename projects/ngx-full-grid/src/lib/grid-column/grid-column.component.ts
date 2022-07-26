import {
  ColumnIdentifier,
  GridSort,
  SortDirection,
} from './../ngx-full-grid.model';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'lib-grid-column',
  templateUrl: './grid-column.component.html',
  styleUrls: ['./grid-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridColumnComponent<T extends object> implements OnInit {
  @Input() column!: ColumnIdentifier<T>;
  @Input() enableSorting = false;
  @Input() enableFilter = false;

  @Input() template?: TemplateRef<unknown>;

  @Output() sortChange = new EventEmitter<GridSort<T>>();
  @Output() resizeStart = new EventEmitter<void>();
  @Output() resizeEnd = new EventEmitter<void>();

  private sortStatus = [SortDirection.ASC, SortDirection.DESC, undefined];
  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {}

  get isSortDesc(): boolean {
    return this.column.sort?.direction === SortDirection.DESC ?? false;
  }

  get isSortAsc(): boolean {
    return this.column.sort?.direction === SortDirection.ASC ?? false;
  }

  onSortChange(): void {
    const currentSortStatusIndex = this.sortStatus.indexOf(
      this.column.sort?.direction
    );
    const newSortStatusIndex =
      currentSortStatusIndex === this.sortStatus.length - 1
        ? 0
        : currentSortStatusIndex + 1;
    const direction = this.sortStatus[newSortStatusIndex];

    this.sortChange.emit(
      direction !== undefined
        ? {
            index: this.column.sort?.index ?? 0,
            direction,
          }
        : undefined
    );
  }
}
