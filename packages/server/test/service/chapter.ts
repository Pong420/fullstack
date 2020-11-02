import {
  CreateChapterDto,
  GetChaptersDto,
  UpdateChapterDto
} from '@/modules/chapter/dto';
import { routes } from '@/constants';
import { ChapterType } from '@/typings';
import { rid } from '@/utils/rid';
import qs from 'qs';

export function createChapterDto(
  payload?: Partial<CreateChapterDto>
): CreateChapterDto {
  return {
    name: rid(10),
    content: rid(10),
    type: ChapterType.Free,
    price: 1,
    ...payload
  };
}

export function createChapter(
  token: string,
  bookID: string,
  payload?: Partial<CreateChapterDto>
) {
  return request
    .post(routes.create_chapter.generatePath({ bookID }))
    .set('Authorization', `bearer ${token}`)
    .send(createChapterDto(payload));
}

export function updateChapter(
  token: string,
  bookID: string,
  chapterID: string,
  payload?: Partial<UpdateChapterDto>
) {
  return request
    .patch(routes.update_chapter.generatePath({ bookID, chapterID }))
    .set('Authorization', `bearer ${token}`)
    .send(payload);
}

export function deleteChapter(
  token: string,
  bookID: string,
  chapterID: string
) {
  return request
    .delete(routes.delete_book.generatePath({ bookID, chapterID }))
    .set('Authorization', `bearer ${token}`)
    .send();
}

export function getChapters(token: string, query: GetChaptersDto = {}) {
  return request
    .get(routes.get_chapters)
    .set('Authorization', `bearer ${token}`)
    .query(qs.stringify(query));
}

export function getChapter(
  token: string,
  bookID: string,
  chapterID: string,
  query?: Record<string, unknown>
) {
  return request
    .get(routes.get_chapter.generatePath({ bookID, chapterID }))
    .set('Authorization', `bearer ${token}`)
    .query(qs.stringify(query));
}