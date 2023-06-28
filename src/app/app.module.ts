import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FlightSearchComponent } from './flight-search/flight-search.component';

@NgModule({
  imports: [BrowserModule, HttpClientModule, FlightSearchComponent],
  declarations: [AppComponent, SidebarComponent, NavbarComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
