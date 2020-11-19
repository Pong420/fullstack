import React from 'react';
import { Button, IconName } from '@blueprintjs/core';
import { openConfirmDialog } from '@/components/ConfirmDialog';
import { Schema$Book, Category } from '@/typings';
import { createBook } from '@/service';
import { Toaster } from '@/utils/toaster';
import { rid } from '@/utils/rid';
import {
  useForm,
  Form,
  BookName,
  BookDescription,
  BookCategory,
  BookTags,
  BookCover
} from './BookForm';

export interface OnCreate {
  onCreate: (payload: Schema$Book) => void;
}

interface CreateBookProps extends OnCreate {}

const icon: IconName = 'book';
const title = 'Create Book';

export function CreateBook({ onCreate }: CreateBookProps) {
  const [form] = useForm();

  async function onConfirm() {
    const payload = await form.validateFields();
    try {
      const book = await createBook(payload);
      onCreate(book);
      Toaster.success({ message: 'Create book success' });
    } catch (error) {
      Toaster.apiError('Create book failure', error);
      throw error;
    }
  }

  const children = (
    <Form form={form} style={{ width: 400 }}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: '1 1 auto' }}>
          <BookName />
          <BookCategory />
        </div>
        <div style={{ marginLeft: 15 }}>
          <BookCover />
        </div>
      </div>
      <BookDescription />
      <BookTags />
    </Form>
  );

  function handleClick() {
    openConfirmDialog({
      icon,
      title,
      children,
      onConfirm,
      onClosed: () => form.resetFields(),
      onOpening: () => {
        process.env.NODE_ENV === 'development' &&
          form.setFieldsValue({
            name: rid(8),
            description: `${rid(10)}\n${rid(20)}\n${rid(30)}`,
            category: Category['玄幻'],
            tags: ['testing']
          });
      }
    });
  }

  return (
    <Button icon={icon} text={title} intent="primary" onClick={handleClick} />
  );
}