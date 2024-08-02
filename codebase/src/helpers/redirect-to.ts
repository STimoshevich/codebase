import {lastValueFrom} from "rxjs";
import {ActivatedRouteSnapshot, Router} from "@angular/router";
import {inject} from "@angular/core";

function redirectTo(
  path: string,
  redirect: string,
  dataType: 'query' | 'route' = 'query',
  mapper?: TMapper
) {
  return async (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);

    const params = mapper ? await lastValueFrom(mapper(route.params)) : route.params;

    if (dataType === 'query') {
      return router.createUrlTree([redirect], { queryParams: params });
    }

    if (dataType === 'route') {
      const paramsArray = Object.values(params);
      if (paramsArray.length) {
        return router.createUrlTree([${redirect}/${paramsArray.join('/')}]);
      }
    }

    return router.createUrlTree([redirect]);
  };
}
