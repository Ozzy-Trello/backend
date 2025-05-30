import { validate as isValidUUID, v4 as uuidv4 } from 'uuid';

import { Error, Op } from "sequelize";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { Paginate } from "@/utils/data_utils";
import Role from "@/database/schemas/role";
import { filterRoleDetail, RoleDetail, RoleDetailUpdate, RoleRepositoryI } from "@/repository/role_access/role_interfaces";
import { defaultPermission } from "@/utils/security_utils";
import db from "@/database";

export class RoleRepository implements RoleRepositoryI {
	createFilter(filter: filterRoleDetail): any {
		const whereClause: any = {};
		const orConditions: any[] = [];
		const notConditions: any[] = [];

		if (filter.id) whereClause.id = filter.id;
		if (filter.name) whereClause.name = filter.name;
		if (filter.description) whereClause.description = filter.description;
		if (filter.default) whereClause.default = filter.default;
	
		if (filter.__orId) orConditions.push({ id: filter.__orId });
		if (filter.__orName) orConditions.push({ name: filter.__orName });
		if (filter.__orDescription) orConditions.push({ description: filter.__orDescription });
		if (filter.__orDefault) orConditions.push({ default: filter.__orDefault });

		if (filter.__notId) notConditions.push({ id: filter.__notId });
		if (filter.__notName) notConditions.push({ name: filter.__notName });
		if (filter.__notDescription) notConditions.push({ description: filter.__notDescription });
		if (filter.__notDefault) notConditions.push({ default: filter.__notDefault });

		if (notConditions.length > 0) {
			whereClause[Op.not] = notConditions;
		}

		if (orConditions.length > 0) {
			whereClause[Op.or] = orConditions;
		}
		return whereClause
	}

	async deleteRole(filter: filterRoleDetail): Promise<number> {
		try {
			const role = await Role.destroy({where: this.createFilter(filter)});
			if (role <= 0) {
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

	async createRole(data: RoleDetail): Promise<ResponseData<RoleDetail>> {
		try {
			const role = await Role.create({
				name: data.name,
				description: data.description,
				permissions: data.permissions,
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create role success",
				data: new RoleDetail({
					id: role.id,
					name: role.name,
					description: role.description,
					permissions: role.permissions,
				})
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getRole(filter: filterRoleDetail): Promise<ResponseData<RoleDetail>> {
		try {
			let role: Role | null;
			let statusCode = StatusCodes.OK;
			role = await Role.findOne({where: this.createFilter(filter)});
			if (!role) {
				if (!filter.createDefaultWhenNone) {
					return {
						status_code: StatusCodes.NOT_FOUND,
						message: "role is not found",
					}
				}
				const role = await db
					.insertInto('role')
					.values({
						id: uuidv4(),
						name: "defautl",
						description: "default role",
						permissions: defaultPermission,
						default: true,
					})
					.returningAll()
					.executeTakeFirst();
				statusCode = StatusCodes.CREATED
			}
			let result = new RoleDetail({
				id: role?.id,
				name: role?.name,
				description: role?.description,
				permissions: role?.permissions,
				default: role?.default,
			})

			return new ResponseData({
				status_code: statusCode,
				message: "role detail",
				data: result,
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getRoleList(filter: filterRoleDetail, paginate: Paginate): Promise<ResponseListData<Array<RoleDetail>>> {
		let result: Array<RoleDetail> = [];
		paginate.setTotal(await Role.count({where: this.createFilter(filter)}))
		const roles = await Role.findAll({
			where: this.createFilter(filter),
			offset: paginate.getOffset(),
			limit: paginate.limit,
		});
		for (const role of roles) {
			result.push(new RoleDetail({
				id: role.id,
				name: role.name,
				description: role.description,
				permissions: role.permissions
			}))
		}
		return new ResponseListData({
			status_code: StatusCodes.OK,
			message: "list role",
			data: result,
		}, paginate)
	}

	async updateRole(filter: filterRoleDetail, data: RoleDetailUpdate): Promise<number> {
		try {
			const effected= await Role.update(data.toObject(), {where: this.createFilter(filter)});
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