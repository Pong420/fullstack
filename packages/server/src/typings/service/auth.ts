import { Timestamp } from './';
import { UserRole } from './user';

export interface JWTSignPayload {
  user_id: string;
  username: string;
  nickname: string;
  role: UserRole;
}

export interface JWTSignResult {
  token: string;
  expiry: Date | string;
}

export interface ValidatePayload extends JWTSignPayload {
  exp: number;
}

export interface Param$CreateRefreshToken extends JWTSignPayload {
  refreshToken: string;
}

export interface Param$UpdateRefreshToken {
  refreshToken: string;
}

export interface Schema$RefreshToken
  extends Param$CreateRefreshToken,
    Timestamp {
  id: string;
}

export interface Param$Login {
  username: string;
  password: string;
}

export interface Schema$Authenticated extends JWTSignResult {
  user: JWTSignPayload;
  isDefaultAc: boolean;
}