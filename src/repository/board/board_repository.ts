import {filterUserDetail, UserDetail, UserDetailUpdate, UserRepositoryI} from "@/repository/user/user_interfaces";
import User from "@/database/schemas/user";
import {Error, Op} from "sequelize";
import {ResponseData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";

export class UserRepository implements UserRepositoryI {
	createFilter(filter: filterUserDetail) : any {
		const whereClause: any = {};
		if (filter.id) whereClause.id = filter.id;
		if (filter.username) whereClause.username = filter.username;
		if (filter.email) whereClause.email = filter.email;
		if (filter.phone) whereClause.phone = filter.phone;
		if (filter.identify) {
			whereClause[Op.or] = [
				{username: filter.identify},
				{email: filter.identify},
				{phone: filter.identify}
			];
		}
		return whereClause
	}

	async deleteUser(filter: filterUserDetail): Promise<number> {
		try {
			const user = await User.destroy({where: this.createFilter(filter)});
			if (user <= 0) {
				return StatusCodes.NOT_FOUND
			}
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async createUser(data: UserDetail): Promise<ResponseData<UserDetail>> {
		try {
			let user = await User.create({
				username: data.username,
				email: data.email!,
				phone: data.phone!,
				password: data.getHashedPassword()
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create user success",
				data: new UserDetail({
					id: user.id,
					email: user.email,
					phone: user.phone,
					password: data.password,
				})
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getUser(filter: filterUserDetail): Promise<ResponseData<UserDetail>> {
		try {
			const user = await User.findOne({where: this.createFilter(filter)});
			if (!user) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "user is not found",
				}
			}
			let result = new UserDetail({
				id: user.id,
				username: user.username,
				email: user.email,
				phone: user.phone,
				password: user.password,
			})

			if (filter.dontShowPassword) delete result.password;

			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "user detail",
				data: result,
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getUserList(filter: filterUserDetail): Promise<Array<UserDetail>> {
		const users = await User.findAll({where: this.createFilter(filter)});
		return users.map(user => user.toJSON() as unknown as UserDetail);
	}

	async updateUser(filter: filterUserDetail, data: UserDetailUpdate): Promise<number> {
		try {
			await User.update(data.toObject(), {where: this.createFilter(filter)});
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}
}