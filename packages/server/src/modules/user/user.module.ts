import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongooseFuzzySearchingField } from 'mongoose';
import { AuthModule } from '@/modules/auth/auth.module';
import { fuzzySearch } from '@/utils/mongoose';
import { Schema$User, UserRole } from '@/typings';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { ClientSchema } from './schemas/client.schema';
import { AuthorSchema } from './schemas/author.schema';
import paginate from 'mongoose-paginate-v2';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        discriminators: [
          {
            name: UserRole.Client,
            schema: ClientSchema
          },
          {
            name: UserRole.Author,
            schema: AuthorSchema
          }
        ],
        useFactory: async () => {
          const fields: MongooseFuzzySearchingField<Schema$User>[] = [
            { name: 'username' },
            { name: 'nickname' },
            { name: 'email', escapeSpecialCharacters: false }
          ];

          UserSchema.plugin(fuzzySearch, { fields });
          UserSchema.plugin(paginate);

          return UserSchema;
        }
      }
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
