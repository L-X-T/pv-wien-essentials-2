import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

import { Flight } from '../../entities/flight';
import { FlightService } from '../shared/services/flight.service';
import { validateCity } from '../shared/validation/city-validator';
import { validateAsyncCity } from '../shared/validation/async-city-validator';
import { validateRoundTrip } from '../shared/validation/round-trip-validator';
import { pattern } from '../../shared/global';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-flight-edit',
  templateUrl: './flight-edit.component.html',
  styleUrls: ['./flight-edit.component.css']
})
export class FlightEditComponent implements OnChanges, OnInit, OnDestroy {
  @Input() flight: Flight | undefined | null;
  @Output() flightChange = new EventEmitter<Flight>();

  debug = true;
  id = '';
  showDetails = '';

  private pattern = pattern;

  editForm: FormGroup = this.fb.group(
    {
      id: [
        0,
        {
          validators: [Validators.required],
          updateOn: 'blur'
        }
      ],
      from: [
        '',
        {
          asyncValidators: [validateAsyncCity(this.flightService)],
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(15),
            Validators.pattern(this.pattern),
            validateCity(['Graz', 'Wien', 'Hamburg', 'Berlin'])
          ],
          updateOn: 'blur'
        }
      ],
      to: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(15),
            Validators.pattern(this.pattern),
            validateCity(['Graz', 'Wien', 'Hamburg', 'Berlin'])
          ],
          updateOn: 'blur'
        }
      ],
      date: [
        '',
        {
          validators: [Validators.required, Validators.minLength(33), Validators.maxLength(33)],
          updateOn: 'blur'
        }
      ]
    },
    {
      validators: validateRoundTrip
    }
  );

  message = '';

  private valueChangesSubscription?: Subscription;
  private saveFlightSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private flightService: FlightService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnChanges(): void {
    this.patchFormValue();
  }

  ngOnInit(): void {
    this.valueChangesSubscription = this.editForm.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged((a, b) => a.id === b.id && a.from === b.from && a.to === b.to && a.date === b.date)
      )
      .subscribe((value) => {
        if (this.debug) {
          console.log(value);
        }
      });

    this.route.params.subscribe((params) => this.onRouteParams(params));
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
    this.saveFlightSubscription?.unsubscribe();
  }

  save(): void {
    this.message = 'Is saving ...';

    this.saveFlightSubscription = this.flightService
      .save(this.editForm.value)
      .pipe(delay(3000))
      .subscribe({
        next: (flight) => {
          if (this.debug) {
            console.log('saved flight:', flight);
          }

          this.flightChange.emit(flight);
          this.flight = flight;
          this.message = 'Success saving!';
          this.patchFormValue();

          setTimeout(() => this.router.navigate(['/flight-search']), 3000);
        },
        error: (err: HttpErrorResponse) => {
          if (this.debug) {
            console.error('Error', err);
          }

          this.message = 'Error saving!';
        }
      });
  }

  private patchFormValue(): void {
    if (this.editForm && this.flight) {
      this.editForm.patchValue(this.flight);
    }
  }

  private onRouteParams(params: Params) {
    this.id = params['id'];
    this.showDetails = params['showDetails'];

    this.flightService.findById(this.id).subscribe({
      next: (flight) => {
        this.flight = flight;
        this.message = 'Success loading!';
        this.patchFormValue();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error', err);
        this.message = 'Error Loading!';
      }
    });
  }
}
