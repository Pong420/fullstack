import React, { useEffect } from 'react';
import router from 'next/router';
import type { AppProps /*, AppContext */ } from 'next/app';
import { CommonMeta } from '@/components/Meta';
import { AuthProvider, useAuthState } from '@/hooks/useAuth';
import { GoBackProvider } from '@/hooks/useGoBack';
import { UserRole } from '@/typings';
import { Toaster } from '@/utils/toaster';
import '@/day';
import '@/styles/globals.scss';
import 'typeface-muli';

interface LayoutProps {
  children?: React.ReactNode;
  disableScrollRestoration?: boolean;
}

interface UnthorizedProps {
  redirect?: string;
  role?: UserRole;
}

interface ExtendAppProps extends AppProps {
  Component: AppProps['Component'] & {
    access?: UserRole[];
    redirect?: string;
    layoutProps?: Omit<LayoutProps, 'children'>;
    layout?: React.ComponentType<LayoutProps>;
  };
}

function UnAuthorized({ redirect, role }: UnthorizedProps) {
  useEffect(() => {
    const isAdminPage = router.asPath.startsWith(`/admin`);
    const pathname = redirect || isAdminPage ? '/admin/login' : '/';

    if (isAdminPage && role === UserRole.Client) {
      Toaster.failure({ message: 'Permission denied' });
    }

    const { href, origin } = window.location;

    router.push(
      { pathname, query: { from: href.slice(origin.length) } },
      pathname
    );
  }, [redirect, role]);
  return <div hidden />;
}

function AppContent(props: ExtendAppProps) {
  const { Component, pageProps } = props;
  const { loginStatus, user } = useAuthState();
  const access = Component.access;

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
  }, []);

  if (access && process.env.NEXT_PUBLIC_GUEST) {
    access.push(process.env.NEXT_PUBLIC_GUEST as UserRole);
  }

  if (!access || (user && access.includes(user.role))) {
    const components = <Component {...pageProps} />;
    const Layout = Component.layout;
    return Layout ? (
      <Layout {...Component.layoutProps}>{components}</Layout>
    ) : (
      components
    );
  }

  if (loginStatus === 'unknown' || loginStatus === 'loading') {
    return null;
  }

  return <UnAuthorized role={user?.role} redirect={Component.redirect} />;
}

function App(props: ExtendAppProps) {
  return (
    <GoBackProvider>
      <AuthProvider>
        <CommonMeta />
        <AppContent {...props} />
      </AuthProvider>
    </GoBackProvider>
  );
}

export default App;
