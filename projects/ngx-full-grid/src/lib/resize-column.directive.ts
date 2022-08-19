import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

import { ColumnWidth } from './ngx-full-grid.model';

@Directive({
  selector: '[libResizeColumn]',
})
export class ResizeColumnDirective<T extends object> implements OnInit {
  @Input() resizeColumn!: boolean;

  @Input() index!: number;

  private startX = 0;

  private startWidth = 0;

  @Input() table!: HTMLElement;

  @Input()
  @HostBinding('style.width.%')
  width?: number;

  startWithNextColumns: ColumnWidth[] = [];

  @Input() minWith!: number;

  @Input()
  @HostBinding('attr.id')
  id?: string;

  @Output() private readonly resizeStart = new EventEmitter<void>();
  @Output() private readonly resizeEnd = new EventEmitter<number>();
  private resizing = false;

  constructor(
    private readonly renderer: Renderer2,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.resizeColumn) {
      const resizer = this.renderer.createElement('span');
      this.renderer.addClass(resizer, 'resize-holder');
      this.renderer.appendChild(this.elementRef.nativeElement, resizer);
      this.renderer.listen(resizer, 'mousedown', this.onMouseDown);

      this.renderer.listen(resizer, 'touchstart', this.onMouseDown);
      this.renderer.listen(resizer, 'touchmove', this.onMouseMove);

      this.renderer.listen(this.table, 'mousemove', this.onMouseMove);
    }
  }

  onMouseDown = (event: MouseEvent) => {
    this.resizing = true;

    const { width, right } = this.elementRef.nativeElement.getBoundingClientRect();
    this.startX = right;
    this.startWidth = width;

    this.startWithNextColumns = this.getAllNextColumns(this.elementRef.nativeElement)
      .filter((col) => col.id !== this.id)
      .map((col) => ({ id: col.id, with: col.getBoundingClientRect().width }));
    this.resizeStart.emit();
  };

  // tslint:disable-next-line: no-unsafe-any
  @HostListener('touchend')
  // tslint:disable-next-line: no-unsafe-any
  @HostListener('window:mouseup', ['$event'])
  private onMouseUp(): void {
    if (this.resizing) {
      this.resizing = false;
      this.renderer.removeClass(this.table, 'resizing');
      this.resizeEnd.emit(this.width);
    }
  }

  getAllNextColumns(element: Element): Element[] {
    const subColumn =
      element.nextElementSibling !== null
        ? this.getAllNextColumns(element.nextElementSibling)
        : undefined;
    const columns: Element[] = [element];
    if (subColumn !== undefined) {
      return [...columns, ...subColumn];
    }

    return columns;
  }

  onMouseMove = (event: MouseEvent | TouchEvent) => {
    if (this.resizing) {
      const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;

      this.renderer.addClass(this.table, 'resizing');

      const columns = this.getAllNextColumns(this.elementRef.nativeElement).filter(
        (column) => column.id !== this.id,
      );

      const newWidth = this.getPxToPercent(
        this.startWidth + clientX - this.startX,
        this.table.clientWidth,
      );

      this.width = newWidth < this.minWith ? this.minWith : newWidth;
      columns.forEach((col) => {
        const nextWithCol =
          (this.startWithNextColumns.find((original) => original.id === col.id)?.with ?? 0) -
          (clientX - this.startX) / columns.length;

        const newColumnWith = this.getPxToPercent(nextWithCol, this.table.clientWidth);

        this.renderer.setStyle(
          col,
          'width',
          `${newColumnWith < this.minWith ? this.minWith : newColumnWith}%`,
        );
      });

      this.changeDetector.detectChanges();
    }
  };

  private getPxToPercent(partialValue: number, totalValue: number): number {
    return (partialValue / totalValue) * 100;
  }
}
