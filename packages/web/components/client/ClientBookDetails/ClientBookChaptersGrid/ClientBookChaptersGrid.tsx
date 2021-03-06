import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import router from 'next/router';
import {
  Order,
  PaginateResult,
  Param$GetChapters,
  Schema$Chapter
} from '@/typings';
import { Card, Classes, Divider, Icon, Tag } from '@blueprintjs/core';
import { Pagination } from '@/components/Pagination';
import {
  gotoPage,
  parseQuery,
  createUsePaginationLocal,
  DefaultCRUDActionTypes
} from '@/hooks/usePaginationLocal';
import { getChapters } from '@/service';
import { Toaster } from '@/utils/toaster';
import classes from './ClientBookChaptersGrid.module.scss';

interface Props {
  bookID: string;
  bookName: string;
  lastVisit?: number;
  chapters: PaginateResult<Schema$Chapter> | null;
  pageSize: number;
}

interface ChaptersGridProps {
  bookName?: string;
  children?: React.ReactNode;
  chapters: Partial<Schema$Chapter>[];
  lastVisit?: number;
}

const onFailure = Toaster.apiError.bind(Toaster, `Get chapters failure`);

const itemClassName = [Classes.MENU_ITEM, classes['chapter-item']].join(' ');

export function ChaptersGrid({
  bookName,
  chapters,
  children,
  lastVisit
}: ChaptersGridProps) {
  const maxLength = String(chapters.slice(-1)[0]?.number || '').length;

  return (
    <Card className={classes['grid-container']}>
      <div className={classes['head']}>章節目錄</div>
      <div className={classes['grid']}>
        {chapters.map(chapter => {
          const tagName = String(chapter.number || '').padStart(maxLength, '0');
          const content = (
            <>
              {typeof lastVisit === 'number' && lastVisit === chapter.number ? (
                <Icon className={classes['map-maker']} icon="map-marker" />
              ) : (
                <Tag minimal className={classes['tag']}>
                  {tagName}
                </Tag>
              )}
              <span className={classes['chapter-name']}>{chapter.name}</span>
            </>
          );

          if (bookName) {
            return (
              <Link
                key={chapter.id}
                prefetch={false}
                href={`/book/${bookName}/chapter/${chapter.number}`}
              >
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className={itemClassName}>{content}</a>
              </Link>
            );
          }

          return (
            <div key={chapter.id} className={itemClassName}>
              {content}
            </div>
          );
        })}
      </div>
      {children}
    </Card>
  );
}

export function ClientBookChaptersGrid({
  bookID,
  bookName,
  lastVisit,
  pageSize,
  chapters: initialChapters
}: Props) {
  const [useChapters] = useState(() => {
    const request = (params?: Param$GetChapters) =>
      getChapters({ ...params, bookID, sort: { createdAt: Order.ASC } });
    return createUsePaginationLocal('id', request, {
      defaultState: { pageSize },
      initializer: initialChapters
        ? (state, reducer) =>
            reducer(state, {
              type: DefaultCRUDActionTypes.PAGINATE,
              payload: initialChapters
            })
        : undefined
    });
  });
  const { data, pagination, state, actions } = useChapters({ onFailure });

  // goto the page of last visit chapter if query has not pageNo
  useEffect(() => {
    const query = parseQuery(router.asPath);
    if (typeof query.pageNo === 'undefined' && typeof lastVisit === 'number') {
      const pageNo = Math.ceil(lastVisit / state.pageSize);
      pageNo > 1 && gotoPage(pageNo);
    }
  }, [state.pageSize, actions, lastVisit]);

  return (
    <ChaptersGrid chapters={data} bookName={bookName} lastVisit={lastVisit}>
      {!!pagination.total ? (
        <>
          <div className={classes['spacer']} />
          <Divider className={classes['divider']} />
          <Pagination {...pagination} />
        </>
      ) : (
        <div className={classes['no-chapters']}>作者尚未創建章節</div>
      )}
    </ChaptersGrid>
  );
}
