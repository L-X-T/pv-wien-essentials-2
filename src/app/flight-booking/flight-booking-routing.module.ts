import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightSearchComponent } from './flight-search/flight-search.component';
import { PassengerSearchComponent } from './passenger-search/passenger-search.component';

const flightBookingRoutes: Routes = [
  {
    path: 'flight-search',
    component: FlightSearchComponent
  },
  {
    path: 'passenger-search',
    component: PassengerSearchComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(flightBookingRoutes)],
  exports: [RouterModule]
})
export class FlightBookingRoutingModule {}
