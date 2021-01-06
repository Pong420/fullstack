import React from 'react';
import { updateUser } from '@/service';
import { UserStatus } from '@/typings';
import { UserActionDialog, UserActionDialogProps } from './UserActionDialog';
import classes from './UserActions.module.scss';

export function RecoverUserDialog(props: UserActionDialogProps) {
  return (
    <UserActionDialog
      {...props}
      intent="danger"
      request={params => updateUser({ ...params, status: UserStatus.Active })}
    >
      <div className={classes['dialog']}>
        Are you sure to recover{' '}
        <span className={classes['highlight']}>{props.user.nickname}</span>{' '}
        account?
      </div>
    </UserActionDialog>
  );
}
