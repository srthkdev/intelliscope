import { Models } from 'appwrite';

// Appwrite User Model
export type AppwriteUser = Models.User<Models.Preferences>;

// Our extended user model with additional data from database
export interface UserData {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  auth_provider?: 'email' | 'google' | string;
  profile_image?: string;
  preferences?: Record<string, any>;
}

// Combined user model
export interface User extends AppwriteUser {
  userData: UserData | null;
}

// Session model
export type Session = Models.Session;