import React, { useMemo } from 'react';
import { Button, Popover, Menu, MenuItem } from '@blueprintjs/core';
import { BookStatus, UserRole } from '@/typings';
import { createOpenOverlay } from '@/utils/openOverlay';
import { Book, OnSuccess, BookActionDialogProps } from './BookActionDialog';
import { DeleteBookDialog } from './DeleteBook';
import { UpdateBookDialog } from './UpdateBook';
import { FinishBookDialog } from './FinishBook';
import { PublishBookDialog } from './PublishBook';
import { RecoverBookDialog } from './RecoverBook';
import { DeleteBookPermanentlyDialog } from './DeleteBookPermanently';

export interface BookActionsProps extends Book, OnSuccess {
  role?: UserRole;
}

export function BookActions({ role, book, onSuccess }: BookActionsProps) {
  const items = useMemo(() => {
    const create = (
      prefix: string,
      Component: React.ComponentType<BookActionDialogProps>
    ) => {
      return (
        <MenuItem
          key={prefix}
          text={prefix}
          onClick={() =>
            createOpenOverlay(Component)({ prefix, book, onSuccess })
          }
        />
      );
    };

    // const isAuthor = role === UserRole.Author;
    // const isAdmin = role === UserRole.Root || role === UserRole.Admin;
    const items: React.ReactElement[] = [];

    if (book.status) {
      if (role === UserRole.Root || role === UserRole.Admin) {
        if (book.status === BookStatus.Deleted) {
          items.push(create('Recover', RecoverBookDialog));

          if (role === UserRole.Root) {
            items.push(
              create('Permanently Delete', DeleteBookPermanentlyDialog)
            );
          }
        } else {
          items.push(create('Delete', DeleteBookDialog));
        }
      } else if (
        role === UserRole.Author &&
        book.status !== BookStatus.Deleted
      ) {
        items.push(create('Update', UpdateBookDialog));
        book.status === BookStatus.Public &&
          items.push(create('Finish', FinishBookDialog));
        book.status === BookStatus.Private &&
          items.push(create('Publish', PublishBookDialog));
      }
    }

    return items;
  }, [role, book, onSuccess]);

  if (!items.length) {
    return null;
  }

  const menu = <Menu>{items}</Menu>;

  return (
    <Popover position="left-top" content={menu}>
      <Button icon="more" minimal />
    </Popover>
  );
}
