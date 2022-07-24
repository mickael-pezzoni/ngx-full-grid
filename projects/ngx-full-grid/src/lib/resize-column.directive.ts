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
  private startWithNextColumn = 0;

  @Input() table!: HTMLElement;

  @Input()
  @HostBinding('style.width.px')
  width?: number;

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
    // this.startWidth = this.elementRef?.nativeElement.clientWidth;
    this.startWithNextColumn =
      this.elementRef?.nativeElement.nextElementSibling?.clientWidth ?? 0;
    this.startX = right;
    this.startWidth = width;

    this.resizeStart.emit();
  };

  @HostListener('window:mouseup', ['$event']) private onMouseUp(): void {
    if (this.resizing) {
      this.resizing = false;
      this.renderer.removeClass(this.table, 'resizing');
      this.resizeEnd.emit(this.width);

      this.resizeEnd.emit();
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

      // Calculate width of column

      // Set table header width

      const width = this.startWidth + event.clientX - this.startX;

      // this.renderer.setStyle(
      //   this.elementRef.nativeElement,
      //   'width',
      //   `${width}px`
      // );

      const nextWith = this.startWithNextColumn - (event.clientX - this.startX);

      console.log(this.startWithNextColumn, ' - ', nextWith);

      // console.log(nextWith);
      this.width = width;

      this.renderer.setStyle(
        this.elementRef.nativeElement.nextElementSibling,
        'width',
        `${nextWith}px`
      );

      // Set table cells width

      // this.cellElements.forEach((cell) =>
      //   this.renderer.setStyle(cell, 'width', `${this.width}px`)
      // );
      this.changeDetector.detectChanges();
    }
  };

  // get cellElements(): Element[] {
  //   return Array.from(this.table.getElementsByClassName(this.id));
  // }
}
