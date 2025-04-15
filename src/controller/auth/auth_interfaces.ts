import {ResponseData} from "@/utils/response_utils";

export interface AuthControllerI {
	Login(data: LoginData): Promise<ResponseData<LoginResponse>>
	RefreshToken(data: RefreshTokenData): Promise<ResponseData<LoginResponse>>
	Register(data: RegisterData): Promise<ResponseData<RegisterResponse>>
}

export interface LoginResponse {
	access_token: string;
	refresh_token: string;
}

export class LoginData {
	identity!: string;
	password!: string;

	constructor(payload: Partial<LoginData>) {
		Object.assign(this, payload);
		this.checkRequired = this.checkRequired.bind(this);
	}

	checkRequired(): string | null{
		if (this.identity == undefined ) return 'identity'
		if (this.password == undefined ) return 'password'
		return null
	}
}

export interface RefreshTokenData {
	access_token: string
	refresh_token: string
}

export interface RegisterResponse {
	access_token: string;
	refresh_token: string;
	user_id: string;
}

export interface RegisterData {
	email: string;
	phone: string;
	username: string;
	password: string;
}