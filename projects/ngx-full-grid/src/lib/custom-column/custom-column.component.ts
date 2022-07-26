import { NgxFullGridComponent } from './../ngx-full-grid.component';
import { DotNestedKeys } from './../ngx-full-grid.model';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'lib-custom-column',
  templateUrl: './custom-column.component.html',
  styleUrls: ['./custom-column.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomColumnComponent<T extends object> implements OnInit {

  @Input() property!: DotNestedKeys<T>;
  @Input() grid!: NgxFullGridComponent<T>

  @Input() headerTemplate?: TemplateRef<unknown>;

  @Input() cellTemplate?: TemplateRef<unknown>;

  constructor() { }


  ngOnInit(): void {
  }

}
