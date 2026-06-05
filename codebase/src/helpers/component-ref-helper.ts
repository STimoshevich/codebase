import {ComponentRef, InputSignal, ModelSignal} from '@angular/core';

type InputValue<T, K extends keyof T> = T[K] extends InputSignal<infer U> | ModelSignal<infer U> ? U : T[K];

export class ComponentRefHelper<T> {
    constructor(private readonly componentRef: ComponentRef<T>) {}

    get ref(): Omit<ComponentRef<T>, 'setInput'> {
        return this.componentRef;
    }

    setInput<K extends keyof T>(key: K, value: InputValue<T, K>) {
        if (this.componentRef) {
            this.componentRef.setInput(key as string, value);
        }
    }
}
