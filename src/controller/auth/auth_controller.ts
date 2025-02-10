import { AuthControllerI, LoginData, LoginResponse} from "@/controller/auth/auth_interfaces";
import { UserRepositoryI } from "@/repository/user/user_interfaces";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {ReasonPhrases, StatusCodes} from "http-status-codes";
import { GenerateToken } from "@/utils/security_utils";
import { Config } from '@/config';

export class AuthController implements AuthControllerI {
	private user_repo: UserRepositoryI

	constructor(user_repo: UserRepositoryI) {
		this.user_repo = user_repo;
		this.Login = this.Login.bind(this);
	}

	async Login(data: LoginData): Promise<ResponseData<LoginResponse>> {
		let account = await this.user_repo.getUser({identify: data.identity});
		if (account.status_code != StatusCodes.OK) {
			switch (account.status_code) {
				case StatusCodes.NOT_FOUND : {
					return new ResponseData({
						message: "Incorrect credential or password",
						status_code: StatusCodes.UNAUTHORIZED,
					})
				}
				case StatusCodes.INTERNAL_SERVER_ERROR : {
					console.log(account.message)
					return new ResponseData({
						message: ReasonPhrases.INTERNAL_SERVER_ERROR,
						status_code: StatusCodes.INTERNAL_SERVER_ERROR,
					})
				}
			}
		}

		const isPasswordValid = account.data!.verifyPassword(data.password);
		if (!isPasswordValid) {
			return {
				status_code: StatusCodes.UNAUTHORIZED,
				message: "Incorrect credential or password",
			};
		}

		const token = GenerateToken({user_id: account.data!.id}, Config.REST_KEY);
		return {
			status_code: StatusCodes.OK,
			message: "Login successful",
			data: {
				token: token
			}
		};
	}
}







//custom field di card -> json