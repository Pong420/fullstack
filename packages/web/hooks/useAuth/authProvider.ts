import React, { ReactNode, useEffect } from 'react';
import { defer, fromEvent, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import {
  Param$Login,
  Param$CreateUser,
  Schema$User,
  Schema$Authenticated
} from '@/typings';
import { clearJwtToken, logout, registration, getJwtToken$ } from '@/service';
import { Toaster } from '@/utils/toaster';
import {
  AuthState,
  LogoutOptions,
  authReducer,
  initialState
} from './authReducer';

type AuthenticatePayload = Param$Login | Param$CreateUser;

export type AuthActions = {
  logout: (options?: LogoutOptions) => void;
  authenticate: (
    payload?: AuthenticatePayload
  ) => Observable<Schema$Authenticated>;
  updateProfile: (payload: Partial<Schema$User>) => void;
};

export const StateContext = React.createContext<AuthState | undefined>(
  undefined
);
export const ActionContext = React.createContext<AuthActions | undefined>(
  undefined
);

const LOGOUT = 'logout';

function authenticate$(
  payload?: AuthenticatePayload
): Observable<Schema$Authenticated> {
  if (payload && 'email' in payload) {
    return defer(() => registration(payload)).pipe(
      switchMap(() => {
        Toaster.success({ message: 'Registration Success' });
        const { username, password } = payload;
        return authenticate$({ username, password });
      }),
      catchError(error => {
        Toaster.apiError('Registration failure', error);
        return throwError(error);
      })
    );
  }

  // handle for login / referesh-token
  const isLogin = !!payload;
  return getJwtToken$(payload).pipe(
    catchError(error => {
      isLogin && Toaster.apiError('Login failure', error);
      return throwError(error);
    })
  );
}

export function AuthProvider({ children }: { children?: ReactNode }) {
  const [state, dispatch] = React.useReducer(authReducer, initialState);

  const authActions = React.useMemo<AuthActions>(() => {
    return {
      updateProfile: payload => dispatch({ type: 'PROFILE_UPDATE', payload }),
      logout: async options => {
        try {
          await logout();
          if (options?.slient !== true) {
            Toaster.success({ message: 'Logout success' });
          }
          clearJwtToken();

          dispatch({ type: 'LOGOUT' });

          try {
            localStorage.removeItem(LOGOUT);
          } catch {}
        } catch (error) {
          Toaster.apiError('Logout failure', error);
        }
      },
      authenticate: payload => {
        dispatch({ type: 'AUTHENTICATE' });

        return authenticate$(payload).pipe(
          tap(auth => {
            try {
              localStorage.setItem(LOGOUT, String(+new Date()));
            } catch {}

            dispatch({ type: 'AUTHENTICATE_SUCCESS', payload: auth.user });
          }),
          catchError(error => {
            dispatch({ type: 'AUTHENTICATE_FAILURE' });
            return throwError(error);
          })
        );
      }
    };
  }, []);

  useEffect(() => {
    const subscription = authActions.authenticate().subscribe(
      () => void 0,
      () => {
        if (process.env.NODE_ENV === 'production') {
          // eslint-disable-next-line
          console.clear();
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [authActions]);

  useEffect(() => {
    // logout current page when user is logout at other tab/page or clear all storage
    const subscription = fromEvent<StorageEvent>(window, 'storage').subscribe(
      event => {
        if (event.key === LOGOUT && event.newValue === null) {
          authActions.logout({ slient: true });
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [authActions]);

  return React.createElement(
    StateContext.Provider,
    { value: state },
    React.createElement(
      ActionContext.Provider,
      { value: authActions },
      children
    )
  );
}
