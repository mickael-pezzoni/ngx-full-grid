import { NgModule } from '@angular/core';
import { NgxFullGridComponent } from './ngx-full-grid.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRippleModule } from '@angular/material/core';
import { FilterPipe } from './filter.pipe';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GridColumnComponent } from './grid-column/grid-column.component';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [NgxFullGridComponent, FilterPipe, GridColumnComponent],
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatInputModule,
    CommonModule,
    MatRippleModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatBadgeModule,
  ],
  exports: [NgxFullGridComponent],
})
export class NgxFullGridModule {}
