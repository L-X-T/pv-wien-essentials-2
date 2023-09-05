import { Component } from '@angular/core';
import { FlightSearchComponent } from './flight-search/flight-search.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  standalone: true,
  imports: [FlightSearchComponent, NavbarComponent, SidebarComponent],
  selector: 'app-flight-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Hello World!';
}
