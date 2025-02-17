import {
	AuthControllerI,
	LoginData,
	LoginResponse, RefreshTokenData,
	RegisterData,
	RegisterResponse
} from "@/controller/auth/auth_interfaces";
import { UserDetail, UserRepositoryI } from "@/repository/user/user_interfaces";
import { ResponseData } from "@/utils/response_utils";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {ExtractToken, GenerateToken} from "@/utils/security_utils";
import { Config } from '@/config';
import { InternalServerError } from "@/utils/errors";

export class AuthController implements AuthControllerI {
	private user_repo: UserRepositoryI

	constructor(user_repo: UserRepositoryI) {
		this.user_repo = user_repo;
		this.Login = this.Login.bind(this);
		this.Register = this.Register.bind(this);
		this.RefreshToken = this.RefreshToken.bind(this);
	}

	async Register(data: RegisterData): Promise<ResponseData<RegisterResponse>> {
		let checkAccount = await this.user_repo.getUser(new UserDetail({username: data.username}));
		if (checkAccount.status_code == StatusCodes.OK) {
			return new ResponseData({
				message: "username already used",
				status_code: StatusCodes.BAD_REQUEST,
			})
		}

		checkAccount = await this.user_repo.getUser(new UserDetail({phone: data.phone}));
		if (checkAccount.status_code == StatusCodes.OK) {
			return new ResponseData({
				message: "phone number already used",
				status_code: StatusCodes.BAD_REQUEST,
			})
		}

		checkAccount = await this.user_repo.getUser(new UserDetail({email: data.email}));
		if (checkAccount.status_code == StatusCodes.OK) {
			return new ResponseData({
				message: "email number already used",
				status_code: StatusCodes.BAD_REQUEST,
			})
		}

		let account = await this.user_repo.createUser(new UserDetail({
			username: data.username,
			password: data.password,
			phone: data.phone,
			email: data.email,
		}));
		return new ResponseData({
			status_code: account.status_code,
			message: "Create user is success",
			data: {
				access_token: GenerateToken({user_id: account.data!.id}, Config.REST_SECRET_KEY, {expiresIn: '1d'}),
				refresh_token: GenerateToken({user_id: account.data!.id}, Config.REST_REFRESH_KEY, {expiresIn: '400d'}),
				user_id: account.data?.id
			},
		})
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

		return {
			status_code: StatusCodes.OK,
			message: "Login successful",
			data: {
				access_token: GenerateToken({user_id: account.data!.id}, Config.REST_SECRET_KEY, {expiresIn: '1d'}),
				refresh_token: GenerateToken({user_id: account.data!.id}, Config.REST_REFRESH_KEY, {expiresIn: '400d'})
			}
		};
	}

	async RefreshToken(data: RefreshTokenData): Promise<ResponseData<LoginResponse>> {
		const tokenData = ExtractToken(data.access_token, Config.REST_SECRET_KEY)
		const refreshData = ExtractToken(data.refresh_token, Config.REST_REFRESH_KEY)
		if (tokenData.user_id !== refreshData.user_id) {
			return new ResponseData({
				message: "Incorrect credential",
				status_code: StatusCodes.UNAUTHORIZED,
			})
		}

		let account = await this.user_repo.getUser({id: tokenData.user_id});
		if (account.status_code !== StatusCodes.OK) {
			switch (account.status_code) {
				case StatusCodes.NOT_FOUND : {
					return new ResponseData({
						message: "Incorrect credential or password",
						status_code: StatusCodes.UNAUTHORIZED,
					})
				}
				case StatusCodes.INTERNAL_SERVER_ERROR : {
					throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, account.message)
				}
			}
		}

		const access_token = GenerateToken({user_id: tokenData.user_id}, Config.REST_SECRET_KEY, {expiresIn: '1h'});
		const refresh_token = GenerateToken({user_id: tokenData.user_id}, Config.REST_REFRESH_KEY, {expiresIn: '400d'});
		return {
			status_code: StatusCodes.OK,
			message: "Refresh token successful",
			data: {
				access_token: access_token,
				refresh_token: refresh_token
			}
		};
	}
}


//custom field di card -> json