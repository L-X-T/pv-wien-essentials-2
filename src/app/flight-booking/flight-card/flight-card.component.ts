import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';

import { Flight } from '../../entities/flight';

@Component({
  selector: 'app-flight-card',
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.css']
})
export class FlightCardComponent implements OnInit, OnChanges, OnDestroy {
  debug = true;

  @Input({ required: true }) item!: Flight;
  @Input() isSelected = false;

  constructor() {
    if (this.debug) {
      console.warn('[FlightCardComponent - constructor()]');
      console.log(this.item);
    }
  }

  ngOnChanges(): void {
    if (this.debug) {
      console.warn('[FlightCardComponent - ngOnChanges()]');
      console.log(this.item);
      console.log('isSelected: ' + this.isSelected);
    }
  }

  ngOnInit(): void {
    if (this.debug) {
      console.warn('[FlightCardComponent - ngOnInit()]');
      console.log(this.item);
      console.log('isSelected: ' + this.isSelected);
    }
  }

  ngOnDestroy(): void {
    if (this.debug) {
      console.error('[FlightCardComponent - ngOnDestroy()]');
      console.log(this.item);
    }
  }
}
