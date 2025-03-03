import Workspace from "@/database/schemas/workspace";
import {Error} from "sequelize";
import {ResponseData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {WorkspaceDetail, WorkspaceDetailUpdate, WorkspaceRepositoryI, filterWorkspaceDetail} from "@/repository/workspace/workspace_interfaces";

export class WorkspaceRepository implements WorkspaceRepositoryI {
	createFilter(filter: filterWorkspaceDetail) : any {
		const whereClause: any = {};
		if (filter.id) whereClause.id = filter.id;
		if (filter.name) whereClause.name = filter.name;
		if (filter.description) whereClause.description = filter.description;
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
			let workspace = await Workspace.create({
				name: data.name!,
				description: data.description!,
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create workspace success",
				data: new WorkspaceDetail({
					id: workspace.id,
					name: data.name!,
					description: data.description!,
				})
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getWorkspace(filter: filterWorkspaceDetail): Promise<ResponseData<WorkspaceDetail>> {
		try {
			const workspace = await Workspace.findOne({where: this.createFilter(filter)});
			if (!workspace) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "workspace is not found",
				}
			}
			let result = new WorkspaceDetail({
				id: workspace.id,
				name: workspace.name!,
				description: workspace.description!,
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

	async getWorkspaceList(filter: filterWorkspaceDetail): Promise<Array<WorkspaceDetail>> {
		const workspaces = await Workspace.findAll({where: this.createFilter(filter)});
		return workspaces.map(workspace => workspace.toJSON() as unknown as WorkspaceDetail);
	}

	async updateWorkspace(filter: filterWorkspaceDetail, data: WorkspaceDetailUpdate): Promise<number> {
		try {
			await Workspace.update(data.toObject(), {where: this.createFilter(filter)});
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}
}