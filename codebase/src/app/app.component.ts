import {
  Component, createComponent,
  DestroyRef,
  Directive, EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  Input, Type,
  ViewEncapsulation
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AsyncPipe} from "@angular/common";
import {LazyComponentComponent} from "./lazy-component/lazy-component.component";

const MAP = new InjectionToken('', {
  factory: () => {
    const map = new Map();

    inject(DestroyRef).onDestroy(() =>
      map.forEach((component) => component.destroy())
    );

    return map;
  }
});

export function withStyles(component: Type<unknown>) {
  const map = inject(MAP);
  const environmentInjector = inject(EnvironmentInjector);

  if (!map.has(component)) {
    map.set(component, createComponent(component, {environmentInjector}));
  }
}

@Component({
  standalone: true,
  template: '<h1>!!!!</h1>',
  styles: '[myDir]:hover { color: red; background: yellow }',
  encapsulation: ViewEncapsulation.None,
})
class MyDirStyles {}

@Directive({
  standalone: true,
  selector: '[myDir]',
})
export class MyDir {
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, MyDir, LazyComponentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',

})
export class AppComponent {
  title = 'codebase';
  protected readonly nothing = withStyles(MyDirStyles);


}
