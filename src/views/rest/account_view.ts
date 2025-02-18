import {AccountRestViewI} from "@/views/rest/interfaces";
import {Request, Response} from "express";
import {AccountControllerI} from "@/controller/account/account_interfaces";
import {StatusCodes} from "http-status-codes";


export default class AccountRestView implements AccountRestViewI {
	private account_controller: AccountControllerI

	constructor(account_controller: AccountControllerI) {
		this.account_controller = account_controller;
		this.GetMyAccount = this.GetMyAccount.bind(this)
		this.GetAccountList = this.GetAccountList.bind(this)
		this.UpdateAccount = this.UpdateAccount.bind(this)
		this.DeleteAccount = this.DeleteAccount.bind(this)
	}

	async GetMyAccount(req: Request, res: Response): Promise<void> {
		let accResponse = await this.account_controller.GetAccount({user_id: req.auth!.user_id})
		if (accResponse.status_code !== StatusCodes.OK) {
			if (accResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
				res.status(accResponse.status_code).json({
					"message": "internal server error",
				})
				return
			}
			res.status(accResponse.status_code).json({
				"message": accResponse.message,
			})
			return
		}
		res.status(accResponse.status_code).json({
			"data": accResponse.data,
			"message": accResponse.message
		})
		return
	}

	async GetAccountList(req: Request, res: Response): Promise<void> {
		let accResponse = await this.account_controller.GetAccountList({user_id: req.auth!.user_id})
		if (accResponse.status_code !== StatusCodes.OK) {
			if (accResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
				res.status(accResponse.status_code).json({
					"message": "internal server error",
				})
				return
			}
			res.status(accResponse.status_code).json({
				"message": accResponse.message,
			})
			return
		}
		res.status(accResponse.status_code).json({
			"data": accResponse.data,
			"message": accResponse.message
		})
		return
	}

	async UpdateAccount(req: Request, res: Response): Promise<void> {
		res.json({message: 'update account route router'});
	}

	async DeleteAccount(req: Request, res: Response): Promise<void> {
		res.json({message: 'delete account route router'});
	}
}
