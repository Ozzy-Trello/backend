import {filterWorkspaceDetail, WorkspaceDetail, WorkspaceDetailUpdate, WorkspaceRepositoryI} from "@/repository/workspace/workspace_interfaces";
import Workspace from "@/database/schemas/workspace";
import {Error, FindOptions, Includeable, Op, QueryTypes} from "sequelize";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {Paginate} from "@/utils/data_utils";
import WorkspaceMember from "@/database/schemas/workspace_member";
import db from "@/database";

export class WorkspaceRepository implements WorkspaceRepositoryI {
	createFilter(filter: filterWorkspaceDetail): any {
		const whereClause: any = {};
		const orConditions: any[] = [];
		const notConditions: any[] = [];

		if (filter.id) whereClause.id = filter.id;
		if (filter.name) whereClause.name = filter.name;
		if (filter.description) whereClause.description = filter.description;
		if (filter.slug) whereClause.slug = filter.slug;
	
		if (filter.__orId) orConditions.push({ id: filter.__orId });
		if (filter.__orName) orConditions.push({ name: filter.__orName });
		if (filter.__orSlug) orConditions.push({ slug: filter.__orSlug });
		if (filter.__orDescription) orConditions.push({ description: filter.__orDescription });

		if (filter.__notId) notConditions.push({ id: filter.__notId });
		if (filter.__notName) notConditions.push({ name: filter.__notName });
		if (filter.__notSlug) notConditions.push({ slug: filter.__notSlug });
		if (filter.__notDescription) notConditions.push({ description: filter.__notDescription });

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
				slug: data.slug!,
			});
			return new ResponseData({
				status_code: StatusCodes.CREATED,
				message: "create workspace success",
				data: new WorkspaceDetail({
					id: workspace.id,
					name: workspace.name,
					description: workspace.description,
					slug: workspace.slug
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
			let qry = db.selectFrom('workspace').selectAll()
			if (filter.user_id_owner){
				qry = qry.
				innerJoin('workspace_member', 'workspace.id', 'workspace_member.workspace_id').
				where('workspace_member.user_id', '=', filter.user_id_owner)
			}
			let qryResult = await qry.executeTakeFirst()
			if(!qryResult) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "workspace is not found",
				}
			}

			let result = new WorkspaceDetail({
				id: qryResult.id,
				name: qryResult.name,
				description: qryResult.description,
				slug: qryResult.slug,
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
		let qry = db.selectFrom('workspace')
		if (filter.user_id_owner){
			qry = qry.
			innerJoin('workspace_member', 'workspace.id', 'workspace_member.workspace_id').
			where('workspace_member.user_id', '=', filter.user_id_owner)
		}
		let total = await qry.select(({ fn }) => fn.count<number>('workspace.id').as('total')).executeTakeFirst();
		paginate.setTotal(total?.total!)
		
		let qryResult = await qry.selectAll().offset(paginate.getOffset()).limit(paginate.limit).execute();
		qryResult.map((raw) => {
			result.push(new WorkspaceDetail({
				id: raw.id,
				name: raw.name,
				description: raw.description,
				slug: raw.slug,
			}))
		})

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