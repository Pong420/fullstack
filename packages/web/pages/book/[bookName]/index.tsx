import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { Meta } from '@/components/Meta';
import { ClientLayout } from '@/components/client/ClientLayout';
import {
  ClientBookDetails,
  ClientBookDetailsParams,
  ClientBookDetailsProps
} from '@/components/client/ClientBookDetails';
import {
  getBookController,
  getChpaterController,
  serialize
} from '@/service/server';
import { getClientFeaturedPageData } from '@/service/featured';
import {
  Order,
  PaginateResult,
  ChapterStatus,
  Schema$Chapter,
  Schema$Book,
  BookStatus
} from '@/typings';

interface Props extends ClientBookDetailsProps {}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await getClientFeaturedPageData();
  const names: string[] = [];
  for (const books of Object.values(data)) {
    for (const book of books) {
      if (!names.includes(book.name)) {
        names.push(book.name);
      }
    }
  }
  return {
    paths: names.map(bookName => ({ params: { bookName } })),
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps<
  Props,
  ClientBookDetailsParams
> = async context => {
  const { bookName, ...query } = context.params || {};

  if (typeof bookName !== 'string') {
    throw new Error(`bookName is ${bookName} expect string`);
  }

  const [bookController, chapterController] = await Promise.all([
    getBookController(),
    getChpaterController()
  ]);

  const book = await bookController
    .getByName({} as any, bookName)
    .then(book => book && serialize<Schema$Book | null>(book))
    .catch(() => null);

  const pageSize = 30;

  const chapters =
    book &&
    book.status &&
    [BookStatus.Public, BookStatus.Finished].includes(book.status)
      ? await chapterController
          .getAll({} as any, book.id, {
            pageSize,
            status: ChapterStatus.Public,
            sort: { createdAt: Order.ASC },
            ...query
          })
          .then(response => serialize<PaginateResult<Schema$Chapter>>(response))
          .catch(() => null)
      : null;

  return {
    revalidate: 60 * 60,
    props: {
      book,
      bookName,
      chapters,
      pageSize
    }
  };
};

export default function ClientBookDetailsPage(props: Props) {
  const { book } = props;
  const head = book ? (
    <Meta
      title={`${book.name} | ${book.authorName} | 睇小說`}
      keywords={book.name}
      description={book.description.replace(/\n/g, '')}
    />
  ) : null;

  return (
    <>
      {head}
      <ClientBookDetails {...props} />
    </>
  );
}

ClientBookDetailsPage.layout = ClientLayout;
