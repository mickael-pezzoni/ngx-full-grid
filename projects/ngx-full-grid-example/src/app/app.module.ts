import { NgxFullGridModule } from './../../../ngx-full-grid/src/lib/ngx-full-grid.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxFullGridModule, MatCheckboxModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
