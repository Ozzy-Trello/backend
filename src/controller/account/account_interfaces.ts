import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import {
  filterUserDetail,
  UserDetail,
  UserDetailUpdate,
} from "@/repository/user/user_interfaces";

export interface AccountControllerI {
  GetAccount(filter: AccountFilter): Promise<ResponseData<AccountResponse>>;
  GetAccountList(
    filter: AccountFilter,
    paginate: Paginate
  ): Promise<ResponseListData<Array<AccountResponse>>>;
  DeleteAccount(filter: AccountFilter): Promise<ResponseData<null>>;
  UpdateAccount(
    filter: AccountFilter,
    data: UpdateAccountData
  ): Promise<ResponseData<null>>;
}

export class AccountResponse {
  id!: string;
  email?: string;
  phone?: string;
  username!: string;
  role?: {
    id: string;
    name: string;
    description: string;
    permission: {
      id: string;
      level: string;
      description: string;
      permissions: {
        board: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
        };
        list: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          move: boolean;
        };
        card: {
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
          move: boolean;
        };
      };
    };
  };

  constructor(payload: Partial<AccountResponse>) {
    Object.assign(this, payload);
  }
}

export function fromUserDetailToAccountResponse(
  data: UserDetail
): AccountResponse {
  return new AccountResponse({
    id: data.id,
    username: data.username,
    phone: data.phone,
    email: data.email,
    role: data.role,
  });
}

export function fromUserDetailToAccountResponseList(
  data: Array<UserDetail>
): Array<AccountResponse> {
  let result: Array<AccountResponse> = [];
  for (const datum of data) {
    result.push(fromUserDetailToAccountResponse(datum));
  }
  return result;
}

export class UpdateAccountData {
  email?: string;
  username?: string;
  phone?: string;

  constructor(payload: Partial<UpdateAccountData>) {
    Object.assign(this, payload);
    this.toUserDetailUpdate = this.toUserDetailUpdate.bind(this);
    this.isEmpty = this.isEmpty.bind(this);
  }

  isEmpty(): boolean {
    return (
      this.phone == undefined &&
      this.email == undefined &&
      this.username == undefined
    );
  }

  toUserDetailUpdate(): UserDetailUpdate {
    return new UserDetailUpdate({
      username: this.username,
      email: this.email,
      phone: this.phone,
    });
  }
}

export class AccountFilter {
  user_id?: string;
  email?: string;
  username?: string;
  phone?: string;

  constructor(payload: Partial<AccountFilter>) {
    Object.assign(this, payload);
    this.isEmpty = this.isEmpty.bind(this);
    this.toFilterUserDetail = this.toFilterUserDetail.bind(this);
  }

  toFilterUserDetail(): filterUserDetail {
    return {
      email: this.email,
      username: this.username,
      id: this.user_id,
      phone: this.phone,
    };
  }

  isEmpty(): boolean {
    return (
      this.user_id == undefined &&
      this.email == undefined &&
      this.username == undefined &&
      this.phone == undefined
    );
  }
}
