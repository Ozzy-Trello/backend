import {UserDetail, UserRepositoryI} from "@/repository/user/user_interfaces";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {
	AccountControllerI,
	AccountFilter,
	AccountResponse,
	UpdateAccountData
} from "@/controller/account/account_interfaces";

export class AccountController implements AccountControllerI {
	private user_repo: UserRepositoryI

	constructor(user_repo: UserRepositoryI) {
		this.user_repo = user_repo;
		this.GetAccount = this.GetAccount.bind(this);
		this.GetAccountList = this.GetAccountList.bind(this);
		this.DeleteAccount = this.DeleteAccount.bind(this);
		this.UpdateAccount = this.UpdateAccount.bind(this);
	}

	async GetAccount(filter: AccountFilter): Promise<ResponseData<AccountResponse>> {
		let checkAccount = await this.user_repo.getUser(new UserDetail({id: filter.user_id}));
		return new ResponseData({
			message: checkAccount.message,
			status_code: checkAccount.status_code,
			data: checkAccount.data,
		})
	}

	async GetAccountList(filter: AccountFilter): Promise<ResponseListData> {
		throw new Error("Method not implemented.");
	}

	async DeleteAccount(filter: AccountFilter): Promise<ResponseData<null>> {
		throw new Error("Method not implemented.");
	}

	async UpdateAccount(filter: AccountFilter, data: UpdateAccountData): Promise<ResponseData<null>> {
		throw new Error("Method not implemented.");
	}


}