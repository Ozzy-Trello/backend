// import User from '@/database/schemas/user';

export interface UserRepositoryI {
  getUser(filter: filterUserDetail): Promise<userDetail | null>;
  getUserList(filter: filterUserDetail): Promise<Array<userDetail>>;
}

export interface filterUserDetail {
  identify?: string;
  username?: string;
  email?: string;
  phone?: string;
}

export class userDetail {
  username!: string;
  email?: string;
  phone?: string;
}
