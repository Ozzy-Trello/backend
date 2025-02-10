import bcrypt from "bcrypt";
import {ResponseData} from "@/utils/response_utils";

export interface UserRepositoryI {
  getUser(filter: filterUserDetail): Promise<ResponseData<UserDetail>>;
  getUserList(filter: filterUserDetail): Promise<Array<UserDetail>>;
}

export interface filterUserDetail {
  identify?: string;
  username?: string;
  email?: string;
  phone?: string;
}

export class UserDetail {
  public id!: string;
  public username!: string;
  public email?: string;
  public phone?: string;
  public password!: string;

  constructor(payload: Partial<UserDetail>) {
    Object.assign(this, payload);
    this.verifyPassword = this.verifyPassword.bind(this)
  }

  public verifyPassword(plainPwd: string) : boolean {
    return bcrypt.compareSync(plainPwd, this.password)
  }
}
