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
  @Input()
  @HostBinding('style.width.px')
  width?: number;
  @Input() index!: number;
  @Input() matTable!: HTMLElement;
  private startX = 0;
  private startWidth = 0;
  private mouseX = 0;

  private mouseDown = false;

  @Output() resizeChange = new EventEmitter<void>();
  @Output() resizeEnd = new EventEmitter<void>();

  constructor(
    private renderer: Renderer2,
    private elelementRef: ElementRef<HTMLElement>
  ) {
    const resizableControl = this.renderer.createElement(
      'div'
    ) as HTMLDivElement;
    this.renderer.addClass(resizableControl, 'resizable-control');
    this.renderer.appendChild(
      this.elelementRef.nativeElement,
      resizableControl
    );

    this.renderer.listen(resizableControl, 'mousedown', (event: MouseEvent) =>
      this.onMouseDown(event)
    );
  }

  ngOnInit() {}

  private onMouseDown(event: MouseEvent): void {
    this.startX = event.pageX;
    this.startWidth = this.elelementRef.nativeElement.offsetWidth;

    // this.startWidth = this.elelementRef.nativeElement.offsetWidth;
    this.mouseDown = true;
    this.resizeChange.emit();
  }

  @HostListener('window:mouseup', ['$event']) private onMouseUp(
    event: MouseEvent
  ): void {
    if (this.mouseDown) {
      this.mouseDown = false;

      this.resizeEnd.emit();
    }
  }

  @HostListener('window:mousemove', ['$event']) private onMouseMove(
    event: MouseEvent
  ): void {
    this.mouseX = event.clientX;
    if (this.mouseDown && this.resizable) {
      const width = this.startWidth - (event.pageX - this.startX - 35);
      this.width = width;
    }
  }

  get cellElements(): Element[] {
    return Array.from(this.matTable.querySelectorAll('.mat-row')).map((row) =>
      row.querySelectorAll('.mat-cell').item(this.index)
    );
  }
}
