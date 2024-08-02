import { Component } from '@angular/core';
import {TestService} from "../test.service";


@Component({
  selector: 'app-lazy-component',
  standalone: true,
  imports: [],
  templateUrl: './lazy-component.component.html',
  styleUrl: './lazy-component.component.css',
})
export class LazyComponentComponent {
  constructor(TestService: TestService) {
  }
}
