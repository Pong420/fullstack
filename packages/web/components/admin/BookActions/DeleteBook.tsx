import React from 'react';
import { updateBook } from '@/service';
import { BookStatus } from '@/typings';
import { BookActionDialog, BookActionDialogProps } from './BookActionDialog';
import classes from './BookActions.module.scss';

export function DeleteBookDialog(props: BookActionDialogProps) {
  return (
    <BookActionDialog
      {...props}
      intent="danger"
      request={params => updateBook({ ...params, status: BookStatus.Deleted })}
    >
      <div className={classes['dialog']}>
        Are you sure to delete the book 「{props.book.name}」?
      </div>
    </BookActionDialog>
  );
}
