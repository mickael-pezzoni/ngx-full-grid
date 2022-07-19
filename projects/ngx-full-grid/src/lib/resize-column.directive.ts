import {
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
export class ResizeColumnDirective<T> {
  @Input('resizeColumn') resizable!: boolean;

  @Input() index!: number;

  private startX = 0;

  private startWidth = 0;

  @Input() table!: HTMLElement;

  @Input()
  @HostBinding('style.width.px')
  width?: number;

  @Output() resizeStart = new EventEmitter<void>();
  @Output() resizeEnd = new EventEmitter<number>();

  private resizing = false;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

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

      this.cellElements.forEach((cell) =>
        this.renderer.setStyle(cell, 'width', `${this.width}px`)
      );
    }
  }

  onMouseDown = (event: MouseEvent) => {
    this.resizing = true;
    this.startX = event.clientX;
    this.startWidth = this.elementRef.nativeElement.offsetWidth;
    this.resizeStart.emit();
  };

  @HostListener('window:mouseup', ['$event']) private onMouseUp(): void {
    if (this.resizing) {
      this.resizing = false;
      this.renderer.removeClass(this.table, 'resizing');
      this.resizeEnd.emit(this.width);
    }
  }

  onMouseMove = (event: MouseEvent) => {
    const offset = 0;
    if (this.resizing && event.buttons) {
      this.renderer.addClass(this.table, 'resizing');

      // Calculate width of column
      const width = this.startWidth + (event.clientX - this.startX - offset);

      // Set table header width
      // this.renderer.setStyle(
      //   this.elementRef.nativeElement,
      //   'width',
      //   `${width}px`
      // );
      console.log(width);

      this.width = width;
      // Set table cells width

      this.cellElements.forEach((cell) =>
        this.renderer.setStyle(cell, 'width', `${width}px`)
      );
    }
  };

  get cellElements(): Element[] {
    return Array.from(this.table.querySelectorAll('.mat-row')).map((row) =>
      row.querySelectorAll('.mat-cell').item(this.index)
    );
  }
}
