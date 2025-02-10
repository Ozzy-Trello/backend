import {ResponseData} from "@/utils/response_utils";

export interface AuthControllerI {
	Login(data: LoginData): Promise<ResponseData<LoginResponse>>
}

export interface LoginResponse  {
	token: string;
}

export interface LoginData {
	identity: string;
	password: string;
}