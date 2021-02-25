import { SnsType } from './global.enums';

export interface JoinDto {
  email: string;
  userPw: string;
  userPwRe: string;
  userLang: number;
  userNick: string;
}

export interface UpdateUserDto {
  screenId?: string;
  intro?: string;
  nickname?: string;
  banner?: object;
  profile?: object;
}

export interface LoginDto {
  email: string;
  userPw: string;
}

export interface ChangePasswordDto {
  email: string;
  userPwNew: string;
  userPwNewRe: string;
  token: string;
}

export interface SnsJoinDto {
  uid: string;
  email: string;
  profile: string;
  name: string;
  displayLanguage: number;
  snsType: SnsType;
}

export interface SnsLoginDto {
  snsData: GoogleLoginDto | FacebookLoginDto;
  snsType: SnsType;
  userLang: number;
}

export interface GoogleLoginDto {
  profileObj: GoogleProfileDto;
}

export interface FacebookLoginDto {
  id: string;
  email: string;
  name: string;
}

export interface GoogleProfileDto {
  googleId: string;
  email: string;
  imageUrl: string;
  name: string;
}

export interface UserProfileDto {
  screenId?: string;
  intro?: string;
  displayLanguage?: number;
  banner?: object;
  profile?: object;
}

export interface UserTokenDto {
  _id: string;
  isConfirmed: boolean;
  isAdmin: boolean;
  iat: number;
  exp: number;
}
