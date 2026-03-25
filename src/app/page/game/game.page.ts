import { Component, input } from '@angular/core';

@Component({
  selector: 'app-game',
  template: `
    <p>Le jeu de code : {{ joinCode() }}</p>
  `,
  imports: [],
})
export class GamePage {
  joinCode = input.required<string>();
}
