import {AccountRestViewI} from "@/views/rest/interfaces";
import {Request, Response} from "express";
import {AccountControllerI, AccountFilter, UpdateAccountData} from "@/controller/account/account_interfaces";
import {StatusCodes} from "http-status-codes";
import {Paginate} from "@/utils/data_utils";


export default class AccountRestView implements AccountRestViewI {
	private account_controller: AccountControllerI

	constructor(account_controller: AccountControllerI) {
		this.account_controller = account_controller;
		this.GetMyAccount = this.GetMyAccount.bind(this)
		this.GetAccountList = this.GetAccountList.bind(this)
		this.UpdateAccount = this.UpdateAccount.bind(this)
		this.UpdateMyAccount = this.UpdateMyAccount.bind(this)
		this.DeleteAccount = this.DeleteAccount.bind(this)
	}

	async GetMyAccount(req: Request, res: Response): Promise<void> {
		let accResponse = await this.account_controller.GetAccount(new AccountFilter({user_id: req.auth!.user_id}))
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
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
		let paginate = new Paginate(page, limit);
		let accResponse = await this.account_controller.GetAccountList(new AccountFilter({}), paginate)
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
			"message": accResponse.message,
			"paginate": accResponse.paginate,
		})
		return
	}

	async UpdateAccount(req: Request, res: Response): Promise<void> {
		let updateResponse = await this.account_controller.UpdateAccount(new AccountFilter({
			email: req.query.email?.toString(),
			user_id: req.params.id?.toString(),
			username: req.query.username?.toString(),
		}), new UpdateAccountData({
			email: req.body.email?.toString(),
			username: req.body.username?.toString(),
		}))
		if (updateResponse.status_code !== StatusCodes.OK) {
			if (updateResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
				res.status(updateResponse.status_code).json({
					"message": "internal server error",
				})
				return
			}
			res.status(updateResponse.status_code).json({
				"message": updateResponse.message,
			})
			return
		}
		res.status(updateResponse.status_code).json({
			"data": updateResponse.data,
			"message": updateResponse.message,
		})
		return
	}

	async UpdateMyAccount(req: Request, res: Response): Promise<void> {
		let updateMyAccResponse = await this.account_controller.UpdateAccount(new AccountFilter({
			user_id: req.auth!.user_id,
		}), new UpdateAccountData({
			phone: req.body.phone?.toString(),
			email: req.body.email?.toString(),
			username: req.body.username?.toString(),
		}))
		if (updateMyAccResponse.status_code !== StatusCodes.OK) {
			if (updateMyAccResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
				res.status(updateMyAccResponse.status_code).json({
					"message": "internal server error",
				})
				return
			}
			res.status(updateMyAccResponse.status_code).json({
				"message": updateMyAccResponse.message,
			})
			return
		}
		res.status(updateMyAccResponse.status_code).json({
			"data": updateMyAccResponse.data,
			"message": updateMyAccResponse.message,
		})
		return
	}

	async DeleteAccount(req: Request, res: Response): Promise<void> {
		let delResponse = await this.account_controller.DeleteAccount(new AccountFilter({
			email: req.query.email?.toString(),
			user_id: req.auth!.user_id,
			username: req.query.username?.toString(),
		}));
		if (delResponse.status_code !== StatusCodes.OK) {
			if (delResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
				res.status(delResponse.status_code).json({
					"message": "internal server error",
				})
				return
			}
			res.status(delResponse.status_code).json({
				"message": delResponse.message,
			})
			return
		}
		res.status(delResponse.status_code).json({
			"data": delResponse.data,
			"message": delResponse.message,
		})
		return
	}
}
