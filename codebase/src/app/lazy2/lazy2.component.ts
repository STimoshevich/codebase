import { Component } from '@angular/core';
import {TestService} from "../test.service";


@Component({
  selector: 'app-lazy2',
  standalone: true,
  imports: [],
  templateUrl: './lazy2.component.html',
  styleUrl: './lazy2.component.css'
})
export class Lazy2Component {
  constructor(TestService: TestService) {
  }
}
