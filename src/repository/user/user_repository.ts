import {filterUserDetail, UserDetail, UserDetailUpdate, UserRepositoryI} from "@/repository/user/user_interfaces";
import User from "@/database/schemas/user";
import {Error, Op} from "sequelize";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {Paginate} from "@/utils/data_utils";

export class UserRepository implements UserRepositoryI {
	createFilter(filter: filterUserDetail): any {
		const whereClause: any = {};
		const orConditions: any[] = [];
		const notConditions: any[] = [];

		if (filter.id) whereClause.id = filter.id;
		if (filter.username) whereClause.username = filter.username;
		if (filter.email) whereClause.email = filter.email;
		if (filter.phone) whereClause.phone = filter.phone;
		if (filter.identify) {
			orConditions.push(
				{ username: filter.identify },
				{ email: filter.identify },
				{ phone: filter.identify }
			);
		}
		if (filter.__orId) orConditions.push({ id: filter.__orId });
		if (filter.__orUsername) orConditions.push({ username: filter.__orUsername });
		if (filter.__orEmail) orConditions.push({ email: filter.__orEmail });
		if (filter.__orPhone) orConditions.push({ phone: filter.__orPhone });

		if (filter.__notId) notConditions.push({ id: filter.__notId });
		if (filter.__notUsername) notConditions.push({ username: filter.__notUsername });
		if (filter.__notEmail) notConditions.push({ email: filter.__notEmail });
		if (filter.__notPhone) notConditions.push({ phone: filter.__notPhone });

		if (notConditions.length > 0) {
			whereClause[Op.not] = notConditions;
		}

		if (orConditions.length > 0) {
			whereClause[Op.or] = orConditions;
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
			let qry = User
			if (filter.withPassword) {
				qry = User.scope('withPassword');
			}
			const user = await qry.findOne({where: this.createFilter(filter)});
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

	async getUserList(filter: filterUserDetail, paginate: Paginate): Promise<ResponseListData<Array<UserDetail>>> {
		let qry = User
		let result: Array<UserDetail> = [];
		if (filter.withPassword) {
			qry = User.scope('withPassword');
		}
		paginate.setTotal(await qry.count({where: this.createFilter(filter)}))
		const users = await qry.findAll({
			where: this.createFilter(filter),
			offset: paginate.getOffset(),
			limit: paginate.limit,
		});
		for (const user of users) {
			result.push(new UserDetail({
				id: user.id,
				username: user.username,
				email: user.email,
				phone: user.phone,
			}))
		}
		return new ResponseListData({
			status_code: StatusCodes.OK,
			message: "list user",
			data: result,
		}, paginate)
	}

	async updateUser(filter: filterUserDetail, data: UserDetailUpdate): Promise<number> {
		try {
			const effected= await User.update(data.toObject(), {where: this.createFilter(filter)});
			if (effected[0] ==0 ){
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
}