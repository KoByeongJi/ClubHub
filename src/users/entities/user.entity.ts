export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}
