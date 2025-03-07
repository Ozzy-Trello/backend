import {UserRepositoryI} from "@/repository/user/user_interfaces";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {
	AccountControllerI,
	AccountFilter,
	AccountResponse, fromUserDetailToAccountResponse, fromUserDetailToAccountResponseList,
	UpdateAccountData
} from "@/controller/account/account_interfaces";
import {StatusCodes} from "http-status-codes";
import {Paginate} from "@/utils/data_utils";

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
		let checkAccount = await this.user_repo.getUser(filter.toFilterUserDetail());
		return new ResponseData({
			message: checkAccount.message,
			status_code: checkAccount.status_code,
			data: fromUserDetailToAccountResponse(checkAccount.data!),
		})
	}

	async GetAccountList(filter: AccountFilter, paginate: Paginate): Promise<ResponseListData<Array<AccountResponse>>> {
		let accounts = await this.user_repo.getUserList(filter.toFilterUserDetail(), paginate);
		return new ResponseListData({
			message: "account list",
			status_code: StatusCodes.OK,
			data: fromUserDetailToAccountResponseList(accounts.data!),
		}, accounts.paginate)
	}

	async DeleteAccount(filter: AccountFilter): Promise<ResponseData<null>> {
		const deleteResponse = await this.user_repo.deleteUser(filter);
		if (deleteResponse == StatusCodes.NOT_FOUND) {
			return new ResponseData({
				message: "Account is not found",
				status_code: StatusCodes.NOT_FOUND,
			})
		}
		return new ResponseData({
			message: "Account is deleted successful",
			status_code: StatusCodes.NO_CONTENT,
		})
	}

	async UpdateAccount(filter: AccountFilter, data: UpdateAccountData): Promise<ResponseData<null>> {
		if (filter.isEmpty()){
			return new ResponseData({
				message: "you need filter to update",
				status_code: StatusCodes.NOT_FOUND,
			})
		}
		if (data.isEmpty()){
			return new ResponseData({
				message: "you need data to update",
				status_code: StatusCodes.NOT_FOUND,
			})
		}
		
    if (filter.user_id){
      let currentAccount = await this.user_repo.getUser({id: filter.user_id});
      if (currentAccount.status_code == StatusCodes.NOT_FOUND){
				return new ResponseData({
					message: "Account is not found",
					status_code: StatusCodes.NOT_FOUND,
				})
      }

      let checkAccount = await this.user_repo.getUser({__notId: filter.user_id, __orEmail:data.email, __orUsername: data.username, __orPhone:data.phone});
      if (checkAccount.status_code == StatusCodes.OK){
				let msg = "this email already taken by others";
				if (!(data.email && currentAccount.data?.email == data.email)){
					msg = "this username already taken by others";
				} else if (!(data.username && currentAccount.data?.username == data.username)){
					msg = "this usename already taken by others";
				} else if (!(data.phone && currentAccount.data?.phone == data.phone)){
					msg = "this phone already taken by others";
				}
				return new ResponseData({
					message: msg,
					status_code: StatusCodes.NOT_FOUND,
				})
			}
		};

		const updateResponse = await this.user_repo.updateUser(filter.toFilterUserDetail(), data.toUserDetailUpdate());
		if (updateResponse == StatusCodes.NOT_FOUND) {
			return new ResponseData({
				message: "Account is not found",
				status_code: StatusCodes.NOT_FOUND,
			})
		}
		return new ResponseData({
			message: "Account is deleted successful",
			status_code: StatusCodes.NO_CONTENT,
		})
	};
}