import { validate as isValidUUID } from 'uuid';

import {filterListDetail, ListDetail, ListDetailUpdate, ListRepositoryI} from "@/repository/list/list_interfaces";
import List from "@/database/schemas/list";
import {Error, Op} from "sequelize";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {Paginate} from "@/utils/data_utils";

export class ListRepository implements ListRepositoryI {
	createFilter(filter: filterListDetail): any {
		const whereClause: any = {};
		const orConditions: any[] = [];
		const notConditions: any[] = [];

		if (filter.id) whereClause.id = filter.id;
		if (filter.name) whereClause.name = filter.name;
		if (filter.board_id) whereClause.board_id = filter.board_id;
	
		if (filter.__orId) orConditions.push({ id: filter.__orId });
		if (filter.__orName) orConditions.push({ name: filter.__orName });
		if (filter.__orBoardId) orConditions.push({ board_id: filter.__orBoardId });

		if (filter.__notId) notConditions.push({ id: filter.__notId });
		if (filter.__notName) notConditions.push({ name: filter.__notName });
		if (filter.__notBoardId) notConditions.push({ board_id: filter.__notBoardId });

		if (notConditions.length > 0) {
			whereClause[Op.not] = notConditions;
		}

		if (orConditions.length > 0) {
			whereClause[Op.or] = orConditions;
		}
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
			const list = await List.create({
				name: data.name!,
				background: data.background!,
				board_id: data.board_id!,
				order: data.order
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create list success",
				data: new ListDetail({
					id: list.id,
					name: list.name,
					background: list.background,
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
			if (filter.id && !isValidUUID(filter.id)){
				return {
					status_code: StatusCodes.BAD_REQUEST,
					message: "list id not valid uuid"
				}
			}
			const list = await List.findOne({where: this.createFilter(filter)});
			if (!list) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "list is not found",
				}
			}
			let result = new ListDetail({
				id: list.id,
				name: list.name,
				background: list.background,
				board_id: list.board_id,
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

	async getListList(filter: filterListDetail, paginate: Paginate): Promise<ResponseListData<Array<ListDetail>>> {
		let result: Array<ListDetail> = [];
		paginate.setTotal(await List.count({where: this.createFilter(filter)}))
		const lists = await List.findAll({
			where: this.createFilter(filter),
			offset: paginate.getOffset(),
			limit: paginate.limit,
		});
		for (const list of lists) {
			result.push(new ListDetail({
				id: list.id,
				name: list.name,
				background: list.background, 
				board_id: list.board_id,
			}))
		}
		return new ResponseListData({
			status_code: StatusCodes.OK,
			message: "list list",
			data: result,
		}, paginate)
	}

	async updateList(filter: filterListDetail, data: ListDetailUpdate): Promise<number> {
		try {
			const effected= await List.update(data.toObject(), {where: this.createFilter(filter)});
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