import { IsBoolean, IsEmail, IsNumber, IsObject, IsString } from 'class-validator';

export class JoinDto {
  @IsEmail()
  public email: string;

  @IsString()
  public userPw: string;

  @IsString()
  public userPwRe: string;

  @IsNumber()
  public userLang: number;

  @IsString()
  public userNick: string;
}

export class UpdateUserDto {
  @IsString()
  public screenId?: string;

  @IsString()
  public intro?: string;

  @IsString()
  public nickname?: string;

  public banner?: object;

  public profile?: object;
}

export class LoginDto {
  @IsEmail()
  public email: string;

  @IsString()
  public userPw: string;
}

export class ChangePasswordDto {
  @IsEmail()
  public email: string;

  @IsString()
  public userPwNew: string;

  @IsString()
  public userPwNewRe: string;

  @IsString()
  public token: string;
}

export class SnsLoginDto {
  @IsObject()
  public snsData: GoogleLoginDto | FacebookLoginDto;

  @IsString()
  public snsType: string;

  @IsString()
  public userLang: string;
}

export class GoogleLoginDto {
  profileObj: GoogleProfileDto;
}

export class FacebookLoginDto {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;
}

export class GoogleProfileDto {
  @IsString()
  googleId: string;

  @IsEmail()
  email: string;

  @IsString()
  imageUrl: string;

  @IsString()
  name: string;
}
