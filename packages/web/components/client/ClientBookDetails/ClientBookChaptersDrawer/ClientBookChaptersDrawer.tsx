import React from 'react';
import router from 'next/router';
import { Button, Card, Icon } from '@blueprintjs/core';
import { BookShelfToggle } from '@/components/client/BookShelf/BookShelfToggle';
import { useChapterListDrawer } from '@/components/client/ChapterListDrawer';
import { withBreakPoint } from '@/hooks/useBreakPoints';
import { Schema$Book } from '@/typings';
import classes from './ClientBookChaptersDrawer.module.scss';

export interface Props {
  book: Schema$Book;
}

export function ClientBookChaptersDrawerCard({
  onClick,
  children
}: {
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={classes['content']}>
      <Card interactive className={classes['trigger']} onClick={onClick}>
        <div className={classes['chapter-head']}>章節目錄</div>
        <Icon icon="chevron-right" />
      </Card>
      {children}
    </div>
  );
}

function ClientBookChaptersDrawerComponent({ book }: Props) {
  const [openChapterListDrawer] = useChapterListDrawer(book.id);
  return (
    <ClientBookChaptersDrawerCard
      onClick={() =>
        openChapterListDrawer({
          onItemClick: chapter =>
            chapter.number &&
            router.push(`/book/${book.name}/chapter/${chapter.number}`)
        })
      }
    >
      <div className={classes['button-group']}>
        <Button
          fill
          intent="primary"
          text="第一章"
          onClick={() => router.push(`/book/${book.name}/chapter/1`)}
        />
        <BookShelfToggle bookID={book.id} fill />
      </div>
    </ClientBookChaptersDrawerCard>
  );
}

export const ClientBookChaptersDrawer = withBreakPoint(
  ClientBookChaptersDrawerComponent,
  {
    validate: breakPoint => breakPoint <= 768
  }
);