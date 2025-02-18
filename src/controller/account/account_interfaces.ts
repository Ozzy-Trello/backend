import {ResponseData, ResponseListData} from "@/utils/response_utils";

export interface AccountControllerI {
	GetAccount(filter: AccountFilter): Promise<ResponseData<AccountResponse>>
	GetAccountList(filter: AccountFilter): Promise<ResponseListData>
	DeleteAccount(filter: AccountFilter): Promise<ResponseData<null>>
	UpdateAccount(filter: AccountFilter, data: UpdateAccountData): Promise<ResponseData<null>>
}

export interface AccountResponse {
	email: string;
	phone: string;
	username: string;
}

export interface UpdateAccountData {
	user_id?: string;
	email?: string;
	username?: string;
}

export interface AccountFilter {
	user_id?: string;
	email?: string;
	username?: string;
}
