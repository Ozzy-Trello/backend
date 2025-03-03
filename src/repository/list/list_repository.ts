import List from "@/database/schemas/list";
import {Error, where} from "sequelize";
import {ResponseData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {filterListDetail, ListDetail, ListDetailUpdate, ListRepositoryI} from "@/repository/list/list_interfaces";
import {Paginate} from "@/utils/data_utils";

export class ListRepository implements ListRepositoryI {
	createFilter(filter: filterListDetail): any {
		const whereClause: any = {};
		if (filter.id) whereClause.id = filter.id;
		if (filter.board_id) whereClause.board_id = filter.board_id;
		if (filter.order) whereClause.order = filter.order;
		if (filter.name) whereClause.name = filter.name;
		if (filter.background) whereClause.background = filter.background;
		return whereClause
	}

	async deleteList(filter: filterListDetail): Promise<number> {
		try {
			const list = await List.destroy({where: this.createFilter(filter)});
			if (list <= 0) {
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

	async createList(data: ListDetail): Promise<ResponseData<ListDetail>> {
		try {
			let list = await List.create({
				board_id: data.board_id!,
				order: data.order!,
				name: data.name!,
				background: data.background!,
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create list success",
				data: new ListDetail({
					id: list.id,
					board_id: data.board_id!,
					name: data.name!,
					background: data.background!,
				})
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getList(filter: filterListDetail): Promise<ResponseData<ListDetail>> {
		try {
			const list = await List.findOne({where: this.createFilter(filter)});
			if (!list) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "list is not found",
				}
			}
			let result = new ListDetail({
				id: list.id,
				board_id: list.board_id!,
				name: list.name!,
				background: list.background!,
			})

			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "list detail",
				data: result,
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getListList(filter: filterListDetail, paginate: Paginate): Promise<Array<ListDetail>> {
		paginate.setTotal(await List.count({where: this.createFilter(filter)}))
		const lists = await List.findAll({
			where: this.createFilter(filter),
			offset: paginate.getOffset(),
			limit: paginate.limit,
		});
		return lists.map(list => list.toJSON() as unknown as ListDetail);
	}

	async updateList(filter: filterListDetail, data: ListDetailUpdate): Promise<number> {
		try {
			const total = await List.update(data.toObject(), {where: this.createFilter(filter)});
			if (total.length <= 0) {
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