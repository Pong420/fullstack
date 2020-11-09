import { Exclude } from 'class-transformer';
import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InsertedUserSchema, UserRole } from '@/typings';
import bcrypt from 'bcrypt';

function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

@Schema({
  discriminatorKey: 'role',
  timestamps: true,
  toJSON: {
    transform: (_model, raw) => new User(raw)
  }
})
export class User implements InsertedUserSchema {
  id: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({
    select: false,
    type: String,
    set: hashPassword,
    get: (pwd: string) => pwd
  })
  @Exclude()
  password: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({
    default: UserRole.Client,
    enum: Object.values(UserRole)
  })
  role: UserRole;

  createdAt: string;

  updatedAt: string;

  @Prop({
    type: String,
    default: function (this: PropOptions & User) {
      return this.username;
    }
  })
  nickname?: string;

  description?: string;

  constructor(payload: Partial<User>) {
    Object.assign(this, payload);
  }

  // just for typings
  toJSON(): User {
    return new User(this);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);