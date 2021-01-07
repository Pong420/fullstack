import {
  BookStatus,
  Schema$Authenticated,
  Schema$Book,
  UserRole
} from '@/typings';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'supertest';
import {
  createUserAndLogin,
  getGlobalUser,
  setupUsers
} from '../../service/auth';
import {
  createBook,
  getBook,
  getBookByName,
  updateBook
} from '../../service/book';

type GetBook = (token: string, book: Schema$Book) => Promise<Response>;

function createGetBookTest(getBook: GetBook) {
  return function testGetBook() {
    const books: Schema$Book[] = [];
    const bookStatus = [
      BookStatus.Public,
      BookStatus.Public,
      BookStatus.Private,
      BookStatus.Finished,
      BookStatus.Deleted
    ];
    let mockAuthor: Schema$Authenticated;

    beforeAll(async () => {
      await setupUsers();
      const response = await createUserAndLogin(root.token, {
        role: UserRole.Author
      });
      mockAuthor = response.body;

      for (const status of bookStatus) {
        let response = await createBook(mockAuthor.token);
        let book = response.body;
        if (status !== BookStatus.Private) {
          response = await updateBook(root.token, book.id, { status });
          book = response.body;
        }
        books.push(book);
      }
    });

    test.each(['root', 'admin', 'author', 'client'])(
      '%s can access public/finished book and return correctly',
      async user => {
        for (const book of books) {
          const response = await getBook(getGlobalUser(user).token, book);
          const noPermission = user === 'author' || user === 'client';

          if (
            book.status === BookStatus.Public ||
            book.status === BookStatus.Finished
          ) {
            if (noPermission) {
              expect(response.body.author).not.toMatchObject({
                id: expect.anything(),
                email: expect.anything(),
                username: expect.anything(),
                password: expect.anything()
              });
            } else {
              expect(response.body.author).toMatchObject({
                id: expect.any(String),
                email: expect.any(String),
                username: expect.any(String)
              });
            }
          } else {
            expect(response.status).toBe(
              noPermission ? HttpStatus.NOT_FOUND : HttpStatus.OK
            );
          }
        }
      }
    );

    test(`author can access his/her all status book`, async () => {
      for (const book of books) {
        const response = await getBook(mockAuthor.token, book);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.author).not.toMatchObject({
          id: expect.anything(),
          email: expect.anything(),
          username: expect.anything(),
          password: expect.anything()
        });
      }
    });

    let deletedBook: Schema$Book;
    test.each`
      user        | expect      | status
      ${'root'}   | ${'can'}    | ${HttpStatus.OK}
      ${'admin'}  | ${'can'}    | ${HttpStatus.OK}
      ${'author'} | ${'can'}    | ${HttpStatus.OK}
      ${'client'} | ${'cannot'} | ${HttpStatus.NOT_FOUND}
    `(`$user $expect access deleted book`, async ({ user, status }) => {
      if (!deletedBook) {
        let response = await createBook(author.token);
        response = await updateBook(root.token, response.body.id, {
          status: BookStatus.Deleted
        });
        deletedBook = response.body;
      }

      expect(deletedBook).toHaveProperty('status', BookStatus.Deleted);

      const response = await getBook(getGlobalUser(user).token, deletedBook);
      expect(response.status).toBe(status);
    });
  };
}

export const testGetBook = createGetBookTest((token, book) =>
  getBook(token, book.id)
);

export const testGetBookByName = createGetBookTest((token, book) =>
  getBookByName(token, book.name)
);
