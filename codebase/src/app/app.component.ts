import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

function hello(whom: string) {
  // @ts-ignore
  console.log(this)
  console.log(`Hello, ${whom}!`)
}

hello('World')

function test(this: unknown) {
  console.log(this)
}


function User() {
  // Происходит неявно:
  // this = {};

  // @ts-ignore
  this.name = 'Alex'

  // Происходит неявно:
  // return this;
}

const animal = {
  eats: true
};
const rabbit = {
  jumps: true,
  __proto__: animal
};


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'codebase';
  constructor() {
    console.log(rabbit.jumps); // true
    // @ts-ignore
    console.log(rabbit.eats); // true
  }
}
