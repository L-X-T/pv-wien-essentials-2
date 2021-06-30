# Template Driven Forms

* [Template Driven Forms](#template-driven-forms)
  * [Using Angular Validators](#using-angular-validators)
  * [Reusable component for displaying the validation errors *](#reusable-component-for-displaying-the-validation-errors-)
  * [Bonus: When to show errors](#bonus-when-to-show-errors)

## Using Angular Validators

In this exercise you will validate the entries in the search form of the ``FlightSearchComponent`` with the built-in validators ``required``, ``minlength``, ``maxlength`` and ``pattern`` and output any validation errors.

Before we start, please ensure that ``noPropertyAccessFromIndexSignature`` is set to false, if that flag is in your ``tsconfig.json``. If the flag is not there at all, then your Angular project was created before Version 13 (strict mode) and then the default TypeScript value will be used which is false.

You can use the following procedure as a guide:

1. Make sure that the search fields are in a ``form`` element and set up a handle for this element. Also make sure that each input field has a ``name`` attribute.

    <details>
    <summary>Show source</summary>
    <p>

    ```html
    <form #flightSearchForm="ngForm">
      [...]
      <input name="from" [(ngModel)]="from" [...]>
      [...]
      <input name="to" [(ngModel)]="to" [...]>
      [...]
    </form>
    ```

    </p>
    </details>

2. Extend the search field ``from`` to include the validation attributes mentioned above and report any validation errors.

    <details>
    <summary>Show source</summary>
    <p>

    ```html
    <input name="from"
           [(ngModel)]="from"   
           required		
           minlength="3"		
           maxlength="15"		
           pattern="[a-zA-ZäöüÄÖÜß ]*">		

    <pre *ngIf="flightSearchForm.controls['from']>{{ flightSearchForm.controls['from'].errors | json }}</pre>

    [...]
    <div *ngIf="flightSearchForm.controls['from']?.hasError('minlength')" class="text-danger">		
      ... minlength ...
    </div>		
    [...]
    ```

    </p>
    </details>

3. Test your solution

## Reusable component for displaying the validation errors *

In order not to have to query the validation errors in the same way over and over again for each input field, it is advisable to use a central component. This can receive the property ``errors`` of the validated ``FormControl``. For example, the expression ``flightSearchForm.controls['from'].errors`` returns the following object if both the validator ``minlength`` and a possibly self-written``city`` validator fail:

```json
{
  "minlength": {
    "requiredLength": 3,
    "actualLength": 1
  },
  "city": true
}
```

Write a component that receives this ``errors`` object (``@Input({ required: true }) errors!: ValidationErrors | null = null;``) and outputs an error message for each of the errors in it. To check whether this object exists and whether it indicates a specific error, *ngIf can be used:

```html
<ng-container *ngIf="errors">
   <div *ngIf="errors.required" class="alert alert-danger" role="alert">
      This field is required.
   </div>

   <div *ngIf="errors.minlength" class="alert alert-danger" role="alert">
      This field is too short.
   </div>
   
   <!--[...]-->
</ng-container>
```

This component should be able to be called up as follows:

```html
<div class="form-group">
  <label>From</label>
  <input class="form-control" name="from"
         [(ngModel)]="from"
         required minlength="3">
   
  <app-flight-validation-errors *ngIf="form.controls['from']" label="From"
                                [errors]="form.controls['from'].errors" />
</div>
```

The errors type should be: ``@Input({ required: true }) errors: ValidationErrors | null = null``. To make this component reusable for different fields, you might want to add another input for the field name like (``@Input() label = 'Field';``). Now you can also use the same component for the ``to`` field and also later for Reactive Forms.

## Bonus: When to show errors

Currently, you can probably see the errors immediately if your fields ``from`` and ``to`` are empty. Is this a good solution? If not how would you improve this?
