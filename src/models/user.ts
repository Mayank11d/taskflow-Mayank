export interface UserModel {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  created_at?: Date;
}
