import {filterWorkspaceDetail, WorkspaceDetail, WorkspaceDetailUpdate, WorkspaceRepositoryI} from "@/repository/workspace/workspace_interfaces";
import Workspace from "@/database/schemas/workspace";
import {Error, FindOptions, Includeable, Op, QueryTypes} from "sequelize";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {Paginate} from "@/utils/data_utils";
import WorkspaceMember from "@/database/schemas/workspace_member";
import db from "@/database/connections";
import User from "@/database/schemas/user";

export class WorkspaceRepository implements WorkspaceRepositoryI {
	createFilter(filter: filterWorkspaceDetail): any {
		const whereClause: any = {};
		const orConditions: any[] = [];
		const notConditions: any[] = [];

		if (filter.id) whereClause.id = filter.id;
		if (filter.name) whereClause.name = filter.name;
		if (filter.description) whereClause.email = filter.description;
	
		if (filter.__orId) orConditions.push({ id: filter.__orId });
		if (filter.__orName) orConditions.push({ name: filter.__orName });
		if (filter.__orDescription) orConditions.push({ email: filter.__orDescription });

		if (filter.__notId) notConditions.push({ id: filter.__notId });
		if (filter.__notName) notConditions.push({ name: filter.__notName });
		if (filter.__notDescription) notConditions.push({ email: filter.__notDescription });

		if (notConditions.length > 0) {
			whereClause[Op.not] = notConditions;
		}

		if (orConditions.length > 0) {
			whereClause[Op.or] = orConditions;
		}
		return whereClause
	}

	async deleteWorkspace(filter: filterWorkspaceDetail): Promise<number> {
		try {
			const workspace = await Workspace.destroy({where: this.createFilter(filter)});
			if (workspace <= 0) {
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

	async createWorkspace(data: WorkspaceDetail): Promise<ResponseData<WorkspaceDetail>> {
		try {
			const workspace = await Workspace.create({
				name: data.name!,
				description: data.description!,
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create workspace success",
				data: new WorkspaceDetail({
					id: workspace.id,
					name: workspace.name,
					description: workspace.description,
				})
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async addMember(id: string, user_id: string, role_id: string): Promise<number> {
		try {
			const workspace = await WorkspaceMember.create({
				workspace_id: id,
				user_id: user_id,
				role_id: role_id,
			});
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async removeMember(id: string, user_id: string): Promise<number> {
		try {
			const workspace = await WorkspaceMember.destroy({where: {user_id, workspace_id: id}});
			if (workspace <= 0) {
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

	async isMember(id: string, user_id: string): Promise<number> {
		try {
			const total = await WorkspaceMember.count({where: {user_id, workspace_id: id}});
			if (total <= 0) {
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

	async getWorkspace(filter: filterWorkspaceDetail): Promise<ResponseData<WorkspaceDetail>> {
		try {
			let includes: Includeable[] = [];
			// if (filter.isEmpty()) {
			// 	return {
			// 		status_code: StatusCodes.BAD_REQUEST,
			// 		message: "you must put the filter first",
			// 	}
			// }
			if (filter.user_id_owner){
				// harusnya menggunakan join query
				// includes.push({
				// 	model:WorkspaceMember, 
				// 	required: true,
				// 	where: {
				// 		user_id: filter.user_id_owner,
				// 	}
				// })

				let user = await User.findOne({where: {id:filter.user_id_owner}});
				if (!user){
					return {
						status_code: StatusCodes.NOT_FOUND,
						message: "user is not found",
					}
				}
				let member = await WorkspaceMember.findOne({
					where: {user_id: filter.user_id_owner},
				})
				if (!member){
					return {
						status_code: StatusCodes.NOT_FOUND,
						message: "this user have no workspace",
					}
				}
				filter.id = member.workspace_id
			}
			
			const workspace = await Workspace.findOne({where: this.createFilter(filter), include: includes});
			if (!workspace) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "workspace is not found",
				}
			}
			let result = new WorkspaceDetail({
				id: workspace.id,
				name: workspace.name,
				description: workspace.description,
			})

			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "workspace detail",
				data: result,
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getWorkspaceList(filter: filterWorkspaceDetail, paginate: Paginate): Promise<ResponseListData<Array<WorkspaceDetail>>> {
		let result: Array<WorkspaceDetail> = [];
		paginate.setTotal(await Workspace.count({where: this.createFilter(filter)}))
		const workspaces = await Workspace.findAll({
			where: this.createFilter(filter),
			offset: paginate.getOffset(),
			limit: paginate.limit,
		});
		for (const workspace of workspaces) {
			result.push(new WorkspaceDetail({
				id: workspace.id,
				name: workspace.name,
				description: workspace.description,
			}))
		}
		return new ResponseListData({
			status_code: StatusCodes.OK,
			message: "list workspace",
			data: result,
		}, paginate)
	}

	async updateWorkspace(filter: filterWorkspaceDetail, data: WorkspaceDetailUpdate): Promise<number> {
		try {
			const effected= await Workspace.update(data.toObject(), {where: this.createFilter(filter)});
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