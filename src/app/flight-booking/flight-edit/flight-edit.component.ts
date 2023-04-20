import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

import { Flight } from '../../entities/flight';
import { FlightService } from '../flight-search/flight.service';
import { validateCity } from '../shared/validation/city-validator';
import { validateAsyncCity } from '../shared/validation/async-city-validator';

@Component({
  selector: 'app-flight-edit',
  templateUrl: './flight-edit.component.html',
  styleUrls: ['./flight-edit.component.css']
})
export class FlightEditComponent implements OnChanges, OnInit, OnDestroy {
  @Input() flight: Flight | undefined | null;

  editForm: FormGroup = this.fb.group({
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
  });

  message = '';

  private valueChangesSubscription?: Subscription;
  private saveFlightSubscription?: Subscription;

  constructor(private fb: FormBuilder, private flightService: FlightService) {}

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
        console.log(value);
      });
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
    this.saveFlightSubscription?.unsubscribe();
  }

  save(): void {
    this.saveFlightSubscription = this.flightService.save(this.editForm.value).subscribe({
      next: (flight) => {
        this.message = 'Success!';
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error', err);
        this.message = 'Error!';
      }
    });
  }
}
