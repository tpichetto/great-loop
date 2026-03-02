import { Request } from 'express';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: Date;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface AuthResponse {
  user: UserPublic;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
