import { model, Schema, Document } from 'mongoose';
import { User } from '../interfaces/users.interface';

const userImageSchema = {
  origin: {
    type: String,
    default: null,
  },
  thumbnail: {
    type: String,
    default: null,
  },
};

const userSchema: Schema = new Schema({
  nickname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  screenId: { type: String },
  country: { type: Number, default: 0 }, // 0: Korean, 1: Japanese, 2: English, 3: Chinese, 4: Taiwan
  displayLanguage: { type: Number, default: 0 }, // 0: Korean, 1: Japanese, 2: English, 3: Chinese(Simplified), 4: Chinese(Traditional)
  availableLanguage: { type: [String] },
  joinDate: { type: Date, required: true, default: Date.now },
  deactivatedAt: { type: Date, default: null },
  termsOfUseAcceptedAt: { type: Date, required: true, default: Date.now },
  intro: { type: String, default: null },
  banner: userImageSchema,
  profile: userImageSchema,
  salt: { type: String },
  isConfirmed: { type: Boolean, required: true, default: false },
  token: { type: String },
  snsId: { type: String },
  snsType: { type: String, default: 'normal' },
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
