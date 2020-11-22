import { Types } from 'mongoose';
import { Type, Exclude } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@/modules/user/schemas/user.schema';
import { Book } from '@/modules/book/schemas/book.schema';
import { Schema$Chapter, ChapterStatus, ChapterType } from '@/typings';
import { Group } from '@/decorators';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_model, raw) => new Chapter(raw)
  }
})
export class Chapter implements Partial<Record<keyof Schema$Chapter, unknown>> {
  @Exclude()
  _id: string;

  id: string;

  @Prop({ type: Number, required: true })
  number: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, default: '', trim: true })
  content: string;

  @Exclude()
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true
  })
  @Type(() => User)
  author: string;

  @Exclude()
  @Prop({
    type: Types.ObjectId,
    ref: Book.name,
    required: true
  })
  @Type(() => Book)
  book: string;

  @Group(['chapter_status_get'])
  @Prop({
    type: Number,
    default: ChapterStatus.Private,
    enum: Object.values(ChapterStatus).filter(v => typeof v === 'number')
  })
  status: ChapterStatus;

  @Prop({
    type: Number,
    required: true,
    enum: Object.values(ChapterType).filter(v => typeof v === 'number')
  })
  type: ChapterType;

  @Prop({ type: Number })
  price?: number;

  createdAt: string;

  updatedAt: string;

  constructor(payload: Partial<Chapter>) {
    Object.assign(this, payload);
  }

  // just for typings
  toJSON(): Chapter {
    return new Chapter(this);
  }
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

ChapterSchema.index({ name: 1, book: 1 }, { unique: true });
