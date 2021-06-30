import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { FlightSearchComponent } from './flight-search/flight-search.component';

@NgModule({
  imports: [SharedModule],
  declarations: [FlightSearchComponent],
  exports: [FlightSearchComponent]
})
export class FlightBookingModule {}
