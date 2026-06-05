import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {TestService} from "../test.service";
import {NgForOf} from "@angular/common";
import {CdkDrag} from "@angular/cdk/drag-drop";

type Item = {
  color: string,
  borderColor: string,
  id: number
  node: Node
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

class Node {
  readonly id = uuidv4();
  constructor(public parentOf: Node | null, public  childOf: Node | null) {
  }
}


//
// class LogicNode {
//   constructor(private falseOf: Node | null, private trueOf: Node | null) {
//   }
// }


@Component({
  selector: 'app-lazy-component',
  standalone: true,
  imports: [
    NgForOf,
    CdkDrag
  ],
  templateUrl: './lazy-component.component.html',
  styleUrl: './lazy-component.component.css',
})
export class LazyComponentComponent {
  items: Item[] = []

  selected: (Item | null)[] = [null, null]

  create() {
    const color = this.generateRandomColor()

    this.items.push({
      color: this.generateRandomColor(),
      id: Date.now(),
      borderColor: this.getContrastingBorderColor(color),
      node: new Node(null, null)
    })
  }

  getId(from: number) {
    return String(from).substring(5)
  }

  select(element: Item) {
    const existed  = this.selected.findIndex(x => x?.id === element.id);

    if(existed >= 0) {
      this.selected[existed] = null
      return
    }

   const index = this.selected.indexOf(null);
    if(index >= 0) {
      this.selected[index] = element;
      const isLast = this.selected.indexOf(null) < 0;
      console.log(isLast)

      if(isLast) {
        this.selected[index] = {...element, node: new Node(element.node.parentOf, this.selected[0]!.node)}
        console.log(this.selected[index]?.node.childOf)
       setTimeout(() => {
         this.selected = [null, null]
       }, 300)
      }
    }
  }

  isSelected(id: number): boolean {
    return this.selected.findIndex(x => x?.id === id) >= 0
  }

  generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

   getContrastingBorderColor(backgroundColor: string): string {
    if (!backgroundColor) {
        return '#FFFFFF'; // Default to white if no background color is provided
    }

    // Assuming backgroundColor is in hex format, remove the hash
    backgroundColor = backgroundColor.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(backgroundColor.substring(0, 2), 16);
    const g = parseInt(backgroundColor.substring(2, 2), 16);
    const b = parseInt(backgroundColor.substring(4, 2), 16);

    // Calculate the perceptive luminance (a simplistic model)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Return black (`#000000`) for light colors, white (`#FFFFFF`) for dark colors
    return luminance > 186 ? '#000000' : '#FFFFFF';
  }
}
