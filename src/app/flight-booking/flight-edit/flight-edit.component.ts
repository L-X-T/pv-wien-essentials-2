import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

import { Flight } from '../../entities/flight';
import { FlightService } from '../flight-search/flight.service';
import { validateCity } from '../shared/validation/city-validator';
import { validateAsyncCity } from '../shared/validation/async-city-validator';
import { validateRoundTrip } from '../shared/validation/round-trip-validator';
import { pattern } from '../../shared/global';

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
    private flightService: FlightService
  ) {}

  ngOnChanges(): void {
    if (this.flight) {
      this.editForm.patchValue(this.flight);
    }
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

    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.showDetails = params['showDetails'];
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
    this.saveFlightSubscription?.unsubscribe();
  }

  save(): void {
    this.saveFlightSubscription = this.flightService.save(this.editForm.value).subscribe({
      next: (flight) => {
        if (this.debug) {
          console.log('saved flight:', flight);
        }

        this.flightChange.emit(flight);

        this.message = 'Success!';
      },
      error: (err: HttpErrorResponse) => {
        if (this.debug) {
          console.error('Error', err);
        }

        this.message = 'Error!';
      }
    });
  }
}
