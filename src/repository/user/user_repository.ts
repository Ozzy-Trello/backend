import {filterUserDetail, userDetail, UserRepositoryI} from "@/repository/user/user_interfaces";
import User from "@/database/schemas/user";
import {Op} from "sequelize";

export class UserRepository implements UserRepositoryI {
	async getUser(filter: filterUserDetail): Promise<userDetail | null> {
		const whereClause: any = {};

		if (filter.username) whereClause.username = filter.username;
		if (filter.email) whereClause.email = filter.email;
		if (filter.phone) whereClause.phone = filter.phone;

		const user = await User.findOne({ where: whereClause });
		return user ? user.toJSON() as unknown as userDetail : null;
	}

	async getUserList(filter: filterUserDetail): Promise<Array<userDetail>> {
		const whereClause: any = {};

		if (filter.username) whereClause.username = { [Op.like]: `%${filter.username}%` };
		if (filter.email) whereClause.email = { [Op.like]: `%${filter.email}%` };
		if (filter.phone) whereClause.phone = { [Op.like]: `%${filter.phone}%` };

		const users = await User.findAll({ where: whereClause });
		return users.map(user => user.toJSON() as unknown as userDetail);
	}
}