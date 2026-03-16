import { Component, Input } from '@angular/core';
import { FieldState } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'form-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (state.invalid() && state.touched()) {
      <div class="form-error">
        @let errors = state.errors();
        @if (errors.length !== 0) {
          <div role="alert">{{ errors[0].message ?? 'Champ invalide' }}</div>
        }
      </div>
    }
  `,
  styles: `
    .form-error {
      //class="input-bottom sc-ion-input-md"
      color: var(--ion-color-danger);
      border: none;
    }
  `,
})
export class FormErrorComponent {
  @Input() state!: FieldState<unknown, string | number>;
}
