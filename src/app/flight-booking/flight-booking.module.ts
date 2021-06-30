import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { FlightSearchComponent } from './flight-search/flight-search.component';
import { FlightCardComponent } from './flight-card/flight-card.component';

@NgModule({
  imports: [SharedModule],
  declarations: [FlightSearchComponent, FlightCardComponent],
  exports: [FlightSearchComponent]
})
export class FlightBookingModule {}
