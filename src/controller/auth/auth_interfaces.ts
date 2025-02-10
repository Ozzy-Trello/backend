import {ResponseData} from "@/utils/response_utils";

export interface AuthControllerI {
	Login(data: LoginData): Promise<ResponseData<LoginResponse>>
	Register(data: RegisterData): Promise<ResponseData<RegisterResponse>>
}

export interface LoginResponse {
	token: string;
}

export interface LoginData {
	identity: string;
	password: string;
}

export interface RegisterResponse {
	token: string;
	user_id: string;
}

export interface RegisterData {
	email: string;
	phone: string;
	username: string;
	password: string;
}