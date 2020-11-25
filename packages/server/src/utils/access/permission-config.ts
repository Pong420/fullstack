import { UserRole } from '@/typings';
import { Permission } from './permission-types';

const admin: Permission[] = [
  'user_create',
  'user_update',
  'user_delete',
  'user_get_all',
  'user_get',

  'book_update',
  'book_delete',
  'book_get_all',
  'book_get',
  'book_status_get',
  'book_status_update',

  'chapter_update',
  'chapter_delete',
  'chapter_get_all',
  'chapter_get',
  'chapter_status_get',
  'chapter_status_update',

  'payment_update',
  'payment_get_by_user',

  'delete-account',
  'modify-password'
];

export const permissonsMap: Record<UserRole, Permission[]> = {
  [UserRole.Root]: [...admin],
  [UserRole.Admin]: admin,
  [UserRole.Author]: [
    'user_get',
    'user_update',

    'book_create',
    'book_update',
    'book_get_all',
    'book_get',
    'book_status_get',
    'book_public',
    'book_finish',

    'chapter_create',
    'chapter_update',
    'chapter_get_all',
    'chapter_get',
    'chapter_status_get',

    'payment_create',

    'cloudinary_sign',

    'modify-password'
  ],
  [UserRole.Client]: ['user_update', 'payment_create', 'modify-password'],
  [UserRole.Guest]: [
    'user_get_all',
    'book_get_all',
    'book_status_get',

    'chapter_get_all',
    'chapter_status_get',

    'payment_get_all'
  ]
};

export const allPermissions = Object.values(permissonsMap).reduce(
  (result, permissions) =>
    permissions.reduce(
      (result, p) => (result.includes(p) ? result : [...result, p]),
      result
    ),
  [] as Permission[]
);