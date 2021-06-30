# Template Driven Forms - Custom Validators

* [Template Driven Forms - Custom Validators](#template-driven-forms---custom-validators)
  * [Custom Validator](#custom-validator)
  * [Parameterizable Validator](#parameterizable-validator)
  * [Bonus: Asynchronous Validator *](#bonus-asynchronous-validator-)
  * [Bonus: Multifield Validator *](#bonus-multifield-validator-)
  * [Bonus: Parameterizable Multifield Validator **](#bonus-parametrizable-multifield-validator-)
  * [Bonus: Asynchronous Multifield Validator ***](#bonus-asynchronous-multifield-validator-)

## Custom Validator

In this exercise you will provide your own validator in the form of a directive. This should check registered city names against a hard-coded whitelist and can be used as follows:

```html
<input name="from" [(ngModel)]="from" city>
```

You can use the following procedure as a guide:

1. Create a subfolder ``validation`` in the folder ``shared``.

2. Set up a ``CityValidatorDirective`` directive in the new subfolder and assign the ``[city]`` selector.

3. Make sure that the new directive is **both** declared **and** exported in the ``SharedModule``.

4. Set up a multi-provider in the directive that binds it to the token ``NG_VALIDATORS``.

    <details>
    <summary>Show source</summary>
    <p>

    ```typescript
    @Directive({
      // eslint-disable-next-line @angular-eslint/directive-selector
      selector: 'input[city]',
      providers: [{
        provide: NG_VALIDATORS,
        useExisting: CityValidatorDirective,
        multi: true
      }]
    })
    export class CityValidatorDirective {
      [...]
    }    
    ```

    </p>
    </details>

5. Let the directive implement the ``Validator`` interface. Check in the ``validate`` method whether the entry is for the cities of ``Hamburg`` or ``Graz``. In all other cases an error should be reported.

    <details>
    <summary>Show source</summary>
    <p>

    ```typescript
    @Directive({
      [...]
    })
    export class CityValidatorDirective implements Validator {
      validCities = ['Graz', 'Wien', 'Hamburg', 'Berlin'];

      validate(c: AbstractControl): ValidationErrors | null {
        if (c.value && !this.validCities.includes(c.value)) {
          return {
            city: {
              actualValue: c.value,
              validCities: this.validCities
            }
          }
        }

        return null; // no error
      }
    }
    ```

    </p>
    </details>

6. Go to the ``FlightSearchComponent`` and apply the new validation directive to the field ``from``. In the event of an error, issue a message.

    <details>
    <summary>Show source</summary>
    <p>

    ```html
    <input name="from"
           [(ngModel)]="from"
           required		
           minlength="3"		
           maxlength="15"		
           pattern="[a-zA-ZäöüÄÖÜß ]*"
           city>
    [...]
   
    <!-- better add this to your Validation Errors component -->
    <div *ngIf="flightSearchForm.controls['from']?.hasError('city')" class="text-danger">
      ... city ...
    </div>
    [...]
    ```

    </p>
    </details>

7. Test your solution.

## Parameterizable Validator

In this exercise you will parameterize the validator from the last exercise so that the whitelist with the valid cities can be passed:

```html
<input name="from" [(ngModel)]="from" [city]="['Graz', 'Hamburg']">
```

You can follow the following procedure:

1. Give the ``CityValidatorDirective`` a property ``city`` of the type ``string[]`` decorated with ``@Input``. Use this property as a whitelist in the ``validate`` method.

    <details>
    <summary>Show source</summary>
    <p>

    ```typescript
    @Directive({
      [...]
    })
    export class CityValidatorDirective implements Validator {
      @Input({ required: true }) city: string[] = [];

      validate(c: AbstractControl): ValidationErrors | null {
        if (c.value && !this.city.includes(c.value)) {
          return {
            city: {
              actualCity: c.value,
              validCities: this.city.join(', ')
            }
          }
        }

        return null;
      }
    }    
    ```

    </p>
    </details>

2. Change to the file ``flight-search.component.html`` and pass a whitelist for the search field ``from`` when calling the directive.

```html
<input [(ngModel)]="from" name="from" [city]="['Graz', 'Hamburg']">
```

3. Test your solution.

## Bonus: Asynchronous Validator *

In this exercise you will write an asynchronous validator that checks the captured city names against the airports supported by the Web API.

Asynchronous validators deliver the validation result with a time delay. They are used, for example, if web APIs have to be integrated for validation, since their responses are returned asynchronously.

You can use the following procedure as a guide:

1. Set up an ``AsyncCityValidatorDirective`` directive in the ``shared/validation`` folder and assign the ``[asyncCity]`` selector.

2. Make sure that the directive is **both** declared **and** exported in the ``SharedModule``.

3. Set up a provider in the directive that binds it to the token ``NG_ASYNC_VALIDATORS``.

    <details>
    <summary>Show source</summary>
    <p>

    ```typescript
    @Directive({
      // eslint-disable-next-line @angular-eslint/directive-selector
      selector: 'input[asyncCity]',
      providers: [{
        provide: NG_ASYNC_VALIDATORS,
        useExisting: AsyncCityValidatorDirective,
        multi: true
      }]
    })
    export class AsyncCityValidatorDirective {
      [...]
    }    
    ```

    </p>
    </details>

4. Inject the FlightService into the constructor of this directive.

    <details>
    <summary>Show source</summary>
    <p>

    ```typescript
    @Directive({
      [...]
    })
    export class AsyncCityValidatorDirective {
      constructor(private flightService: FlightService) {}
      [...]
    }    
    ```

    </p>
    </details>

5. Let the directive implement the AsyncValidator interface. Check in the ``validate`` method whether there are flights in the web API that depart from this airport.

   To do this, you can call the ``find`` method of the ``FlightService`` and transfer the current input for the ``from`` parameter and an empty string for the ``to`` parameter.

   Map the result obtained with the ``map`` method of the observable to an empty error description object if flights are found. Otherwise, map it to an object that shows the error `` asyncCity``. Return the observable received from ``map``.

    <details>
    <summary>Show source</summary>
    <p>

    ```typescript
    import { map, delay } from 'rxjs/operators';
    [...]

    @Directive({
    ...
    })
    export class AsyncCityValidatorDirective implements AsyncValidator {
      constructor(private flightService: FlightService) {}

      validate(c: AbstractControl): Observable<ValidationErrors | null> {
        return this.flightService.find(c.value, '').pipe(
          map(flights => (flights.length) > 0 ? null : { asyncCity: true }),
          delay(2000) // <-- delay; can be removed later...
        );
      }
    }
    ```

    </p>
    </details>

6. Go to the ``FlightSearchComponent`` and apply the new validation directive to the field ``from``. In the event of an error, issue a message.

    <details>
    <summary>Show source</summary>
    <p>

    ```html
    <input name="from" 
           [(ngModel)]="from"
           required		
           minlength="3"		
           maxlength="15"		
           pattern="[a-zA-ZäöüÄÖÜß ]*"
           asyncCity>
    [...]
    <!-- better add this to your Validation Errors component -->
    <div *ngIf="flightSearchForm.controls['from']?.hasError('asyncCity')" class="text-danger">
      ... asyncCity ...
    </div>
    [...]
    ```

    </p>
    </details>

7. Also use the ``pending`` property of the ``FormControl`` to check whether asynchronous validations are still pending.

    <details>
    <summary>Show source</summary>
    <p>

    ```html
    <div *ngIf="flightSearchForm.controls['from']?.pending">
      ... Executing Async Validator ...
    </div>
    [...]
    ```

    </p>
    </details>

8. Test your solution. **Please note** that Angular only runs asynchronous validators if none of the synchronous validators reports an error. For example, enter ``Rom`` in the whitelist of the synchronous validator. If you now search for ``Rom``, all synchronous validators will validate this value correctly and the new asynchronous validator will return an error because ``Rom`` is not entered in the database.

## Bonus: Multifield Validator *

You can also create validators that apply to a form and take multiple fields into account. Use the following information to write a validator that prohibits sightseeing flights (e.g. flights from Frankfurt to Frankfurt).

To do this, the selector must address the entire form:

```typescript
@Directive({
  selector: 'form[roundTrip]',
  providers: [...]
})
[...]
```

In this case, the ``validate`` method can convert the transferred ``AbstractControl`` into a ``FormGroup``:

```typescript
validate(c: AbstractControl): ValidationErrors | null {
  const group: FormGroup = c as FormGroup; // type cast

  const fromCtrl = group.controls['from'];
  const toCtrl = group.controls['to'];

  if (!fromCtrl || !toCtrl || !fromCtrl.value) {
    return null;
  }

  […]
}
```

You can then access the individual controls. In this example the names of the controls are hard-coded. However, as in one of the last exercises, this could also be transferred via data binding.

A validation can be carried out with these controls:

```typescript
if (fromCtrl.value === toCtrl.value) {
  return {
    roundTrip: true
  }
}

return null
```

After **registering and exporting** in the ``SharedModule``, the validation directive can be used for the respective ``from`` element:

```html
<form #flightSearchForm="ngForm" roundTrip>
  [...]
  <div *ngIf="flightSearchForm.hasError('roundTrip')">...roundTrip...</div>
  [...]
</form>
```

## Bonus: Parameterizable Multifield Validator **

The validator in the last example has hard-coded access to the fields ``from`` and ``to``. Create a way to pass this information via data binding. To do this, use properties with the decorator ``@Input``.

## Bonus: Asynchronous Multifield Validator ***

Combine the information from the last few exercises to write an asynchronous multifield validator. This should check whether there are flights that lead from ``from`` to ``to``.

<!--
  * [Bonus: Formatted date in text field ***](#bonus-formatted-date-in-text-field-)

## Bonus: Formatted date in text field ***

Write a directive with the help of which the date of birth of a passenger can be displayed and edited as a formatted date in a text field. You can find information on this in Manfred's blog at https://www.angulararchitects.io/aktuelles/parser-und-formatter-in-angular-2/.
-->
<!--
  * [Bonus: Component for editing a date ***](#bonus-component-for-editing-a-date-)

## Bonus: Component for editing a date ***

Write a component for editing a passenger's date of birth. You must implement the ControlValueAccessor interface so that this component interacts with Angular's forms handling. You can find information on this in Manfred's blog at https://www.angulararchitects.io/aktuelles/eigene-formular-steuerelemente-fuer-angular-2-schreiben/.
-->
