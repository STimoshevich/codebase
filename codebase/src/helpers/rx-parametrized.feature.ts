import {
  computed,
  effect,
  inject,
  Injector,
  ResourceStatus,
  runInInjectionContext,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {
  patchState,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  withProps,
  withState,
} from '@ngrx/signals';
import {Observable} from 'rxjs';

import {APP_CONFIGURATION_TOKEN} from '../../tokens';

type InternalCachedResourceRef<TItem> = {
  value: Signal<TItem | undefined>;
  isLoading: Signal<boolean>;
  error: Signal<Error | undefined>;
  status: Signal<ResourceStatus>;
  reload: () => boolean;
  update: (updater: (current: TItem | undefined) => TItem | undefined) => void;
};

export type CachedResourceRef<TItem> = Omit<InternalCachedResourceRef<TItem>, 'update'>;

type PrivateKey<TName extends string> = `_${TName}`;
type UpdateKey<TName extends string> = PrivateKey<`update${Capitalize<TName>}`>;

export function withRxResourceParametrizedState<
  TRequest,
  TItem,
  Input extends SignalStoreFeatureResult,
  TName extends string = 'data',
>(
  loader: (request: TRequest) => Observable<TItem>,
  name: TName = 'data' as TName,
): SignalStoreFeature<
  Input,
  {
    props: {
      [K in PrivateKey<TName>]: (request: TRequest) => CachedResourceRef<TItem>;
    } & {
      [K in UpdateKey<TName>]: (
        request: TRequest,
        updater: (current: TItem | undefined) => TItem | undefined,
      ) => void;
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    state: {};
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    methods: {};
  }
> {
  const privateName = `_${name}` as PrivateKey<TName>;

  return signalStoreFeature(
    withState<{
      [privateName]?: Record<string, TItem | undefined>;
    }>({
      [privateName]: undefined,
    }),
    withProps((store) => {
      const injector = inject(Injector);
      const appConfiguration = inject(APP_CONFIGURATION_TOKEN);
      const cache = signal(new Map<string, InternalCachedResourceRef<TItem>>(), {
        equal: () => false,
      });

      function createResource(request: TRequest): InternalCachedResourceRef<TItem> {
        const resource = runInInjectionContext(injector, () =>
          untracked(() =>
            rxResource({
              stream: () =>
                runInInjectionContext(injector, () => loader(request)),
            }),
          ),
        );

        return {
          value: resource.value.asReadonly(),
          isLoading: resource.isLoading,
          error: computed(() => resource.error()),
          status: computed(() => resource.status()),
          reload: () => resource.reload(),
          update: (
            updater: (current: TItem | undefined) => TItem | undefined,
          ) =>
            resource.update((current) =>
              updater(current as TItem | undefined),
            ),
        };
      }

      function data(request: TRequest): CachedResourceRef<TItem> {
        const key = JSON.stringify(request);
        const cacheMap = untracked(() => cache());
        let resource = cacheMap.get(key);

        if (!resource) {
          resource = createResource(request);
          cacheMap.set(key, resource);
        }

        return resource;
      }

      if (!appConfiguration.production) {
        effect(() => {
          const map = cache();
          const snapshot: Record<string, TItem | undefined> = {};

          map.forEach((resource, key) => {
            snapshot[key] = resource.value();
          });

          patchState(store, {
            [privateName]: snapshot,
          });
        });
      }

      const updateName =
        String(name).charAt(0).toUpperCase() + String(name).slice(1);
      const updateKey = `_update${updateName}` as UpdateKey<TName>;

      return {
        [privateName]: data,
        [updateKey]: (
          request: TRequest,
          updater: (current: TItem | undefined) => TItem | undefined,
        ) =>
          untracked(() => cache())
            .get(JSON.stringify(request))
            ?.update(updater),
      };
    }),
  ) as any;
}
