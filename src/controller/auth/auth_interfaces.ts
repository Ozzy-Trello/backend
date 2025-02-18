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

export interface LoginData {
	identity: string;
	password: string;
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