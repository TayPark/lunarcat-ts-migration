export interface User {
  // MongoDB id
  _id: string;

  // defaults
  email: string;
  password: string;
  salt: string;
  token: string;
  nickname: string;
  intro?: string;
  screenId: string;
  isConfirmed: boolean;

  // Country, Language
  country: number;
  displayLanguage: number;
  availableLanguage: string[];

  joinDate: Date;
  deactivatedAt?: Date;
  termsOfUseAcceptedAt: Date;

  // Images
  profile?: Object;
  banner?: Object;

  // SNS Login
  snsId?: string;
  snsType?: string;
}
