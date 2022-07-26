import { ColumnIdentifier } from './ngx-full-grid.model';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { MatTable } from '@angular/material/table';

@Directive({
  selector: '[libResizeColumn]',
})
export class ResizeColumnDirective<T extends object> {
  @Input('resizeColumn') resizable!: boolean;

  @Input() index!: number;

  private startX = 0;

  private startWidth = 0;

  @Input() table!: HTMLElement;

  @Input()
  @HostBinding('style.width.%')
  width?: number;

  startWithNextColumns: { id: string; with: number }[] = [];

  private withLimit = 5;

  @Input()
  @HostBinding('attr.id')
  id?: string;

  @Output() resizeStart = new EventEmitter<void>();
  @Output() resizeEnd = new EventEmitter<number>();
  private resizing = false;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef<HTMLElement>,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.resizable) {
      const row = this.renderer.parentNode(this.elementRef.nativeElement);
      const thead = this.renderer.parentNode(row);
      this.table = this.renderer.parentNode(thead);

      const resizer = this.renderer.createElement('span');
      this.renderer.addClass(resizer, 'resize-holder');
      this.renderer.appendChild(this.elementRef.nativeElement, resizer);
      this.renderer.listen(resizer, 'mousedown', this.onMouseDown);
      this.renderer.listen(this.table, 'mousemove', this.onMouseMove);
    }
  }

  onMouseDown = (event: MouseEvent) => {
    this.resizing = true;

    const { width, right } =
      this.elementRef.nativeElement.getBoundingClientRect();
    this.startX = right;
    this.startWidth = width;

    this.startWithNextColumns = this.getAllNextColumns(
      this.elementRef.nativeElement
    )
      .filter((col) => col.id !== this.id)
      .map((col) => ({ id: col.id, with: col.getBoundingClientRect().width }));
    this.resizeStart.emit();
  };

  @HostListener('window:mouseup', ['$event']) private onMouseUp(): void {
    if (this.resizing) {
      this.resizing = false;
      this.renderer.removeClass(this.table, 'resizing');
      this.resizeEnd.emit(this.width);

    }
  }

  getAllNextColumns(element: Element): Element[] {
    const subColumn =
      element.nextElementSibling !== undefined &&
      element.nextElementSibling !== null
        ? this.getAllNextColumns(element.nextElementSibling)
        : undefined;
    const columns: Element[] = [element];
    if (subColumn !== undefined) {
      return [...columns, ...subColumn];
    }

    return columns;
  }

  onMouseMove = (event: MouseEvent) => {
    if (this.resizing && event.buttons) {
      this.renderer.addClass(this.table, 'resizing');

      const columns = this.getAllNextColumns(
        this.elementRef.nativeElement
      ).filter((column) => column.id !== this.id);

      const totalWidth: number = columns
        .map((column) => column.clientWidth)
        .reduce((value, previousValue) => value + previousValue);

      const newWidth = this.getPxToPercent(
        this.startWidth + event.clientX - this.startX,
        this.table.clientWidth
      );

      this.width = newWidth < this.withLimit ? this.withLimit : newWidth;
      columns.forEach((col) => {
        const nextWithCol =
          (this.startWithNextColumns.find((original) => original.id === col.id)
            ?.with ?? 0) -
          (event.clientX - this.startX) / columns.length;

        const newColumnWith = this.getPxToPercent(
          nextWithCol,
          this.table.clientWidth
        );

        this.renderer.setStyle(
          col,
          'width',
          `${newColumnWith < this.withLimit ? this.withLimit : newColumnWith}%`
        );
      });

      this.changeDetector.detectChanges();
    }
  };

  private getPxToPercent(partialValue: number, totalValue: number): number {
    return (partialValue / totalValue) * 100;
  }
}
