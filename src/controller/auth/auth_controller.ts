import {AuthControllerI, LoginData, LoginSuccessResponse} from "@/controller/auth/auth_interfaces";
import {UserRepositoryI} from "@/repository/user/user_interfaces";
import {RestError} from "@/errors/rest_error";
import {StatusCodes} from "http-status-codes";

export class AuthController implements AuthControllerI {
	private user_repo: UserRepositoryI

	constructor(user_repo: UserRepositoryI) {
		this.user_repo = user_repo;
	}

	async Login(data: LoginData): Promise<LoginSuccessResponse> {
		let account = await this.user_repo.getUser({identify: data.identity});
		if (!account) {
			throw new RestError("user not found", StatusCodes.BAD_REQUEST)
		}
		return {
			token: "aaa"
		}
	}
}
//custom field di card -> json