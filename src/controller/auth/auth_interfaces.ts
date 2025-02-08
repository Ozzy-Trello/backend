export interface AuthControllerI {
	Login(data: LoginData): Promise<LoginSuccessResponse>
}

export interface LoginSuccessResponse {
	token: string;
}

export interface LoginData {
	identity: string;
	password: string;
}