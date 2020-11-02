import { CreateBookDto, GetBooksDto, UpdateBookDto } from '@/modules/book/dto';
import { routes } from '@/constants';
import { Param$CreateBook } from '@/typings';
import { rid } from '@/utils/rid';
import qs from 'qs';

export function createBookDto(
  payload?: Partial<CreateBookDto>
): Param$CreateBook {
  return { name: rid(10), ...payload };
}

export function createBook(token: string, payload?: Partial<CreateBookDto>) {
  return request
    .post(routes.create_book)
    .set('Authorization', `bearer ${token}`)
    .send(createBookDto(payload));
}

export function updateBook(
  token: string,
  id: string,
  payload?: Partial<UpdateBookDto>
) {
  return request
    .patch(routes.update_book.generatePath({ id }))
    .set('Authorization', `bearer ${token}`)
    .send(payload);
}

export function deleteBook(token: string, id: string) {
  return request
    .delete(routes.delete_book.generatePath({ id }))
    .set('Authorization', `bearer ${token}`)
    .send();
}

export function getBooks(token: string, query: GetBooksDto = {}) {
  return request
    .get(routes.get_books)
    .set('Authorization', `bearer ${token}`)
    .query(qs.stringify(query));
}

export function getBook(
  token: string,
  id: string,
  query?: Record<string, unknown>
) {
  return request
    .get(routes.get_book.generatePath({ id }))
    .set('Authorization', `bearer ${token}`)
    .query(qs.stringify(query));
}
