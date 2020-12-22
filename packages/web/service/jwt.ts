import type { Param$Login, Schema$Authenticated } from '@/typings';
import { routes } from '@/constants';
import { defer, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { api } from './api';
import { login, refreshToken } from './auth';

let jwtToken$: Observable<Schema$Authenticated> | null = null;

export function clearJwtToken() {
  jwtToken$ = null;
}

const authenticate$ = (payload?: Param$Login) =>
  defer(() => (payload ? login(payload) : refreshToken()));

export function getJwtToken$(payload?: Param$Login) {
  return (jwtToken$ || authenticate$(payload)).pipe(
    switchMap(payload => {
      const expired = +new Date(payload.expiry) - +new Date() <= 30 * 1000;
      jwtToken$ = expired ? authenticate$() : jwtToken$ || of(payload);
      return jwtToken$;
    })
  );
}

const excludeAuthUrls = [
  routes.login,
  routes.refresh_token,
  routes.registration
];

const authUrlRegex = new RegExp(
  `(${excludeAuthUrls.join('|').replace(/\//g, '\\/')})$`
);

const isAuthUrl = (url?: string) => url && authUrlRegex.test(url);

api.interceptors.request.use(async config => {
  if (!isAuthUrl(config.url)) {
    const { token } = await getJwtToken$().toPromise();
    config.headers['Authorization'] = 'bearer ' + token;
  }
  return config;
});
