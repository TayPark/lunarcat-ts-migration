import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public userPw: string;

  @IsString()
  public userPwRe: string;

  @IsString()
  public userLang: string;

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
  @IsString()
  public userPw: string;

  @IsString()
  public userPwNew: string;

  @IsString()
  public userPwNewRe: string;
}
