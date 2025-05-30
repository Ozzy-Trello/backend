import {AuthRestViewI} from "@/views/rest/interfaces";
import {Request, Response} from "express";
import {AuthControllerI, LoginData, LoginResponse, RegisterResponse} from "@/controller/auth/auth_interfaces";
import {ReasonPhrases, StatusCodes} from "http-status-codes";
import {ResponseData} from "@/utils/response_utils";


export default class AuthRestView implements AuthRestViewI {
	private controller: AuthControllerI

	constructor(c: AuthControllerI) {
		this.controller = c;
		this.Login = this.Login.bind(this);
		this.Register = this.Register.bind(this);
		this.RefreshToken = this.RefreshToken.bind(this);
	}

	async Login(req: Request, res: Response): Promise<void> {
		try {
			const login_response: ResponseData<LoginResponse> = await this.controller.Login(new LoginData({
				identity: req.body.identity,
				password: req.body.password
			}))
			if (login_response.status_code != StatusCodes.OK) {
				if (login_response.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
					console.log(login_response.message)
					res.status(login_response.status_code).json({
						"message": "internal server error",
					})
					return
				}
				res.status(login_response.status_code).json({
					"message": login_response.message,
				})
				return
			}
			res.status(login_response.status_code).json({
				"data": login_response.data,
				"message": login_response.message
			})
			return
		} catch (err) {
			console.log(err)
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({"message": ReasonPhrases.INTERNAL_SERVER_ERROR})
		}
	}

	async RefreshToken(req: Request, res: Response): Promise<void> {
		try {
			const refresh_response: ResponseData<LoginResponse> = await this.controller.RefreshToken({
				access_token: req.body.access_token,
				refresh_token: req.body.refresh_token
			})
			if (refresh_response.status_code != StatusCodes.OK) {
				if (refresh_response.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
					console.log(refresh_response.message)
					res.status(refresh_response.status_code).json({
						"message": "internal server error",
					})
					return
				}
				res.status(refresh_response.status_code).json({
					"message": refresh_response.message,
				})
				return
			}
			res.status(refresh_response.status_code).json({
				"data": refresh_response.data,
				"message": refresh_response.message
			})
			return
		} catch (err) {
			console.log(err)
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({"message": ReasonPhrases.INTERNAL_SERVER_ERROR})
		}
	}

	async Register(req: Request, res: Response): Promise<void> {
		const controllerRes: ResponseData<RegisterResponse> = await this.controller.Register({
			email: req.body.email,
			username: req.body.username,
			phone: req.body.phone,
			password: req.body.password,
		})
		if (controllerRes.status_code != StatusCodes.CREATED) {
			if (controllerRes.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
				res.status(controllerRes.status_code).json({
					"message": "internal server error",
				})
				return
			}
			res.status(controllerRes.status_code).json({
				"message": controllerRes.message,
			})
			return
			
		}
		res.status(controllerRes.status_code).json({
			"data": controllerRes.data,
			"message": controllerRes.message
		})
		return
	}
}
