import React, { MouseEvent } from 'react';
import {
  openConfirmDialog,
  ConfirmDialogProps
} from '@/components/ConfirmDialog';
import { Logo } from '@/components/Logo';
import { createUserForm } from '@/components/UserForm';
import { useAuthActions } from '@/hooks/useAuth';
import { Toaster } from '@/utils/toaster';
import { RegistrationForm, LoginForm } from './ClientForm';

interface OnClick<E extends HTMLElement = HTMLElement> {
  onClick?: (event: MouseEvent<E>) => void;
}

const { useForm } = createUserForm();

const dialogProps: Partial<ConfirmDialogProps> = {
  icon: 'user',
  divider: false,
  footerMode: 2
};

export function withAuthRequired<P extends OnClick>(
  Component: React.ComponentType<P>
) {
  return function OpenLoginDialog(props: P) {
    const [form] = useForm();
    const { authenticate } = useAuthActions();

    function handleConfirm(errorMsg: string) {
      return async function () {
        const payload = await form.validateFields();
        try {
          await authenticate(payload).toPromise();
        } catch (error) {
          Toaster.apiError(errorMsg, error);
          throw error;
        }
      };
    }

    function handleRegistration() {
      openConfirmDialog({
        ...dialogProps,
        onCancel: handleLogin,
        onConfirm: handleConfirm('Registration failure'),
        title: '會員註冊',
        confirmText: '註冊',
        cancelText: '登入',
        children: (
          <RegistrationForm form={form}>
            <Logo />
          </RegistrationForm>
        )
      });
    }

    function handleLogin() {
      openConfirmDialog({
        ...dialogProps,
        onCancel: handleRegistration,
        onConfirm: handleConfirm('Login failure'),
        title: '會員登入',
        confirmText: '登入',
        cancelText: '註冊',
        children: (
          <LoginForm form={form}>
            <Logo />
          </LoginForm>
        )
      });
    }

    return <Component {...((props as unknown) as P)} onClick={handleLogin} />;
  };
}
