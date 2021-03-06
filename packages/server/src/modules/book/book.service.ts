import { FilterQuery } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChapterService } from '@/modules/chapter/chapter.service';
import {
  BookStatus,
  JWTSignPayload,
  Schema$Category,
  Schema$Tags,
  UserRole
} from '@/typings';
import { MongooseCRUDService, PaginateModel, Document } from '@/utils/mongoose';
import { Book } from './schemas/book.schema';

const allBookStatus = Object.values(BookStatus).filter(
  (v): v is BookStatus => typeof v === 'number'
);

@Injectable()
export class BookService extends MongooseCRUDService<Book> {
  readonly bookStatus = allBookStatus.map(status => ({ status }));
  readonly publicStatus = [
    { status: BookStatus.Public },
    { status: BookStatus.Finished }
  ];

  constructor(
    @InjectModel(Book.name)
    readonly bookModel: PaginateModel<Book & Document>,
    readonly chapterService: ChapterService
  ) {
    super(bookModel);
  }

  isPublicStatus(status: BookStatus) {
    return status === BookStatus.Public || status === BookStatus.Finished;
  }

  categories() {
    return this.bookModel
      .aggregate<Schema$Category>()
      .allowDiskUse(true)
      .group({ _id: '$category', total: { $sum: 1 } })
      .project({
        _id: 0,
        category: '$_id',
        total: 1
      });
  }

  tags() {
    return this.bookModel
      .aggregate<Schema$Tags>()
      .allowDiskUse(true)
      .unwind('$tags')
      .group({ _id: '$tags', total: { $sum: 1 } })
      .project({
        _id: 0,
        tag: '$_id',
        total: 1
      });
  }

  async random(
    total: number,
    query: FilterQuery<Book> = {
      $or: [{ status: BookStatus.Public }, { status: BookStatus.Finished }]
    }
  ) {
    const count = await this.bookModel.countDocuments(query);

    const pool: number[] = [];
    while (pool.length < total && pool.length < count) {
      const rand = Math.floor(Math.random() * count);
      if (!pool.includes(rand)) {
        pool.push(rand);
      }
    }

    const books: (Book & Document)[] = [];
    for (const idx of pool) {
      const book = await this.bookModel.findOne(query).skip(idx);
      book && books.push(book);
    }

    return books;
  }

  getRoleBasedQuery(user?: JWTSignPayload, defaultQuery?: FilterQuery<Book>) {
    const query: FilterQuery<Book> = { ...defaultQuery };
    if (!user || user.role === UserRole.Client) {
      if (
        !query.status ||
        typeof query.status !== 'number' ||
        !this.isPublicStatus(query.status)
      ) {
        delete query.status;
        query.$or = this.publicStatus;
      }
    } else if (user.role === UserRole.Author) {
      if (query.status) {
        query.author = user.user_id;
      } else {
        query.$or = this.bookStatus.map(payload =>
          this.isPublicStatus(payload.status)
            ? payload
            : { ...payload, author: user.user_id }
        );
      }
    }
    return query;
  }

  async getWordCount(
    query: FilterQuery<Book>
  ): Promise<{ wordCount: number; numOfBook: number } | null> {
    const [result] = await this.bookModel
      .aggregate()
      .allowDiskUse(true)
      .match(query)
      .option({ autopopulate: false })
      .group({
        _id: '$author',
        numOfBook: { $sum: 1 },
        wordCount: { $sum: '$wordCount' }
      })
      .project({
        _id: 0,
        wordCount: 1,
        numOfBook: 1
      });
    return result || null;
  }
}
