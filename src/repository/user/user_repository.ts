import {filterUserDetail, UserDetail, UserRepositoryI} from "@/repository/user/user_interfaces";
import User from "@/database/schemas/user";
import {Op, Error} from "sequelize";
import {ResponseData} from "@/utils/response_utils";
import {ReasonPhrases, StatusCodes} from "http-status-codes";

export class UserRepository implements UserRepositoryI {
	async getUser(filter: filterUserDetail): Promise<ResponseData<UserDetail>> {
		const whereClause: any = {};

		if (filter.username) whereClause.username = filter.username;
		if (filter.email) whereClause.email = filter.email;
		if (filter.phone) whereClause.phone = filter.phone;
		if (filter.identify) {
			whereClause[Op.or] = [
				{ username: filter.identify },
				{ email: filter.identify },
				{ phone: filter.identify }
			];
		}

		try {
			const user = await User.findOne({ where: whereClause });
			if (!user) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "user is not found",
				}
			}
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "user detail",
				data: new UserDetail({
					id: user.id,
					username: user.username,
					email: user.email,
					phone: user.phone,
					password: user.password,
				})
			});
		} catch (e) {
			if (e instanceof Error) {
				return new ResponseData({
					status_code: StatusCodes.INTERNAL_SERVER_ERROR,
					message: e.message,
				})
			}
			return {
				status_code: StatusCodes.INTERNAL_SERVER_ERROR,
				message: ReasonPhrases.INTERNAL_SERVER_ERROR,
			}
		}
	}

	async getUserList(filter: filterUserDetail): Promise<Array<UserDetail>> {
		const whereClause: any = {};

		if (filter.username) whereClause.username = { [Op.like]: `%${filter.username}%` };
		if (filter.email) whereClause.email = { [Op.like]: `%${filter.email}%` };
		if (filter.phone) whereClause.phone = { [Op.like]: `%${filter.phone}%` };

		const users = await User.findAll({ where: whereClause });
		return users.map(user => user.toJSON() as unknown as UserDetail);
	}
}