import { Directive, ElementRef, Input } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Mark from 'mark.js';
import { HighlightService } from './highlight.service';

export const HIGHLIGHT_EXCLUDE = 'highlight-exclude';

@Directive({
  selector: '[creditorHighlight]',
  standalone: true,
})
export class HighlightDirective {
  private _marker: Mark;
  private readonly _options = {
    exclude: Array<string>(),
    className: 'text-highlight',
  };
  @Input() set exclude(value: string[]) {
    this._options.exclude = [...value];
  }

  constructor(
    private _element: ElementRef<HTMLElement>,
    private _highlightSearch: HighlightService
  ) {
    this._highlightSearch.highlight$
      .pipe(takeUntilDestroyed())
      .subscribe((x) => this._highlight(x));
    this._marker = new Mark(this._element.nativeElement);
  }

  private _highlight(text: string | null): void {
    this._marker.unmark({
      done: () => {
        if (text) {
          this._marker.mark(text, this._options);
        }
      },
    });
  }

  public repeat(): void {
    this._highlightSearch.repeat();
  }
}
