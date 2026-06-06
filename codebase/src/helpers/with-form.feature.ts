import {linkedSignal} from '@angular/core';
import {type FieldTree, form} from '@angular/forms/signals';
import {
    type SignalStoreFeature,
    signalStoreFeature,
    type SignalStoreFeatureResult,
    withProps,
} from '@ngrx/signals';

import {StoreCtx} from '../types/store-ctx.type';

/**
 * Конфиг формы: ключ -> функция, вычисляющая начальное значение поля из store.
 * Возвращаемые типы выводятся автоматически.
 */
export type WithFormConfig<Input extends SignalStoreFeatureResult> = {
    [key: string]: (store: StoreCtx<Input>) => unknown;
};

/** Извлекает модель формы из конфига, сохраняя точные типы значений. */
type FormModelOf<Cfg> = {
    [K in keyof Cfg]: Cfg[K] extends (store: never) => infer R ? R : never;
};

export type WithFormProps<Cfg> = {
    form: FieldTree<FormModelOf<Cfg>>;
};

export function withForm<
    Input extends SignalStoreFeatureResult,
    Cfg extends WithFormConfig<Input>,
>(
    config: Cfg,
): SignalStoreFeature<
    Input,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {state: {}; props: WithFormProps<Cfg>; methods: {}}
> {
    return signalStoreFeature(
        withProps((store) => {
            const ctx = store as StoreCtx<Input>;

            const model = linkedSignal<FormModelOf<Cfg>>(() => {
                const result = {} as FormModelOf<Cfg>;

                console.log('config', config);
                for (const key of Object.keys(config) as Array<keyof Cfg>) {
                    result[key] = config[key](ctx) as FormModelOf<Cfg>[typeof key];
                }

                return result;
            });

            return {
                form: form(model) as FieldTree<FormModelOf<Cfg>>,
            };
        }),
    );
}
