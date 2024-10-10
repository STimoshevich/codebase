import {TestBed} from "@angular/core/testing";
import {Component, input} from "@angular/core";
import {ComponentRefHelper} from "./component-ref-helper";

@Component({
  selector: 'button[testComponent]',
  standalone: true,
  template: '<span style="background: red"> <ng-content/> -> {{testValue()}}</span>',
})
export class ButtonComponent {
  constructor() {}

  testValue = input(0);
}

function setup() {
  @Component({
    standalone: true,
    template: '<button testComponent [testValue]="testValue()">test</button>',
    imports: [ButtonComponent],
  })
    // eslint-disable-next-line @angular-eslint/component-class-suffix
  class TestComponentHost {
    testValue = input(0);
  }

  TestBed.configureTestingModule({
    imports: [TestComponentHost],
  });

  const fixtureHost = TestBed.createComponent(TestComponentHost);
  const hostComponent = fixtureHost.componentInstance;
  const componentHostComponentRef = new ComponentRefHelper(fixtureHost.componentRef);
  const buttonComponentDebugElement = fixtureHost.debugElement.query(By.directive(ButtonComponent));
  const buttonComponentEl: HTMLElement = buttonComponentDebugElement.nativeElement;

  fixtureHost.detectChanges();

  return {fixtureHost, buttonComponentDebugElement, buttonComponentEl, hostComponent, componentHostComponentRef};
}

describe('someTest', () => {
  it('should work', () => {
    const {fixtureHost, buttonComponentEl, componentHostComponentRef} = setup();

    componentHostComponentRef.setInput('testValue', 123);
    fixtureHost.detectChanges();
    expect(buttonComponentEl.textContent).toBe('test -> 123');
  });
});
