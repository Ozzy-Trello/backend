import bcrypt from "bcrypt";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";

export interface UserRepositoryI {
  getUser(filter: filterUserDetail): Promise<ResponseData<UserDetail>>;
  createUser(data: UserDetail): Promise<ResponseData<UserDetail>>;
  deleteUser(filter: filterUserDetail): Promise<number>;
  updateUser(filter: filterUserDetail, data: UserDetailUpdate): Promise<number>;
  getUserList(filter: filterUserDetail, paginate: Paginate): Promise<ResponseListData<Array<UserDetail>>>;
}

export interface filterUserDetail {
  id?: string;
  identify?: string;
  username?: string;
  email?: string;
  phone?: string;
  withPassword?: boolean;

  __orId?: string;
  __orUsername?: string;
  __orEmail?: string;
  __orPhone?: string;

  __notId?: string;
  __notUsername?: string;
  __notEmail?: string;
  __notPhone?: string;
}

export class UserDetailUpdate {
  public username?: string;
  public email?: string;
  public phone?: string;
  public password?: string;

  constructor(payload: Partial<UserDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.username) data.username = this.username;
    if (this.email) data.email = this.email;
    if (this.phone) data.phone = this.phone;
    if (this.password) data.password = this.password;
    return data
  }
}

export class UserDetail {
  public id?: string;
  public username!: string;
  public email?: string;
  public phone?: string;
  public password?: string;

  constructor(payload: Partial<UserDetail>) {
    Object.assign(this, payload);
    this.verifyPassword = this.verifyPassword.bind(this)
    this.getHashedPassword = this.getHashedPassword.bind(this)
  }

  public verifyPassword(plainPwd: string) : boolean {
    return bcrypt.compareSync(plainPwd, this.password!)
  }

  public getHashedPassword() : string {
    const saltRounds = 10;
    return bcrypt.hashSync(this.password!, saltRounds);
  }
}
