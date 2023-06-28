import { Component, DestroyRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Flight } from '../entities/flight';
import { FlightService } from './flight.service';
import { Observable, Observer, pipe, Subject, Subscription } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';
import { CityPipe } from '../pipes/city.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CityPipe],
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css']
})
export class FlightSearchComponent implements OnDestroy {
  from = 'Graz';
  to = 'Hamburg';

  flights: Flight[] = [];
  flights$: Observable<Flight[]> | undefined;
  flightsSubscription: Subscription | undefined;

  selectedFlight: Flight | undefined | null;

  message = '';

  private readonly destroyRef = inject(DestroyRef);
  private readonly flightService = inject(FlightService);

  private readonly onDestroySubject = new Subject<void>();
  readonly terminator$ = this.onDestroySubject.asObservable();

  search(): void {
    // 1. my observable
    this.flights$ = this.flightService.find(this.from, this.to).pipe(share());

    // 2. my observer
    const flightsObserver: Observer<Flight[]> = {
      next: (flights) => (this.flights = flights),
      error: (errResp) => console.error('Error loading flights', errResp),
      complete: () => console.warn('complete')
    };

    // 3a. my subscription
    this.flightsSubscription?.unsubscribe();
    this.flightsSubscription = this.flights$.subscribe(flightsObserver);

    // 3b. takeUntil terminator$ emits
    this.flights$.pipe(takeUntil(this.terminator$)).subscribe(flightsObserver);

    // 3c. takeUntilDestroyed
    this.flights$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(flightsObserver);
  }

  ngOnDestroy(): void {
    // 4a. my unsubscribe
    this.flightsSubscription?.unsubscribe();

    // 4b. subject emit thru terminator$
    this.onDestroySubject.next(void 0);
    this.onDestroySubject.complete();
  }

  select(f: Flight): void {
    this.selectedFlight = f;
  }

  save(): void {
    if (this.selectedFlight) {
      this.flightService
        .save(this.selectedFlight)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (flight) => {
            this.selectedFlight = flight;
            this.message = 'Success!';
          },
          error: (errResponse) => {
            console.error('Error', errResponse);
            this.message = 'Error!';
          }
        });
    }
  }
}
