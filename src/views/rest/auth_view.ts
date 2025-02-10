import {AuthRestViewI} from "@/views/rest/interfaces";
import {Request, Response} from "express";
import {AuthControllerI, LoginResponse, RegisterResponse} from "@/controller/auth/auth_interfaces";
import {ReasonPhrases, StatusCodes} from "http-status-codes";
import {ResponseData} from "@/utils/response_utils";


export default class AuthRestView implements AuthRestViewI {
	private controller: AuthControllerI

	constructor(c: AuthControllerI) {
		this.controller = c;
		this.Login = this.Login.bind(this);
		this.Register = this.Register.bind(this);
	}

	async Login(req: Request, res: Response): Promise<void> {
		try {
			const login_credential: ResponseData<LoginResponse> = await this.controller.Login({
				identity: req.body.identity,
				password: req.body.password
			})
			if (login_credential.message) {
				res.status(login_credential.status_code).json({
					"message": login_credential.message,
				})
				return
			}
			res.status(login_credential.status_code).json(login_credential.data)
			return
		} catch {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({"message": ReasonPhrases.INTERNAL_SERVER_ERROR})
		}
	}

	async RefreshToken(req: Request, res: Response): Promise<void> {
		res.json({message: 'patch token route router'});
	}

	async Register(req: Request, res: Response): Promise<void> {
		try {
			const register_response: ResponseData<RegisterResponse> = await this.controller.Register({
				email: req.body.email,
				username: req.body.username,
				phone: req.body.phone,
				password: req.body.password,
			})
			if (register_response.message) {
				res.status(register_response.status_code).json({
					"message": register_response.message,
				})
				return
			}
			res.status(register_response.status_code).json(register_response.data)
			return
		} catch {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({"message": ReasonPhrases.INTERNAL_SERVER_ERROR})
		}
	}
}