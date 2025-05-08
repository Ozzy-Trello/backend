import { validate as isValidUUID } from 'uuid';

import {filterListDetail, filterMoveList, ListDetail, ListDetailUpdate, ListRepositoryI} from "@/repository/list/list_interfaces";
import List from "@/database/schemas/list";
import {Error, Op} from "sequelize";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {Paginate} from "@/utils/data_utils";
import db from '@/database';
import { Transaction } from 'kysely';
import { Database } from '@/types/database';

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
		if (filter.__orCardLimit) orConditions.push({ card_limit: filter.__orCardLimit });

		if (filter.__notId) notConditions.push({ id: filter.__notId });
		if (filter.__notName) notConditions.push({ name: filter.__notName });
		if (filter.__notBoardId) notConditions.push({ board_id: filter.__notBoardId });
		if (filter.__notCardLimit) notConditions.push({ card_limit: filter.__notCardLimit });

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

			if(!data.card_limit) data.card_limit = 50;

			let maxOrder = await this.getMaxListOrderInBoard(data.board_id!);
			maxOrder = maxOrder + 10000;

			const list = await List.create({
				name: data.name!,
				background: data.background!,
				board_id: data.board_id!,
				order: maxOrder,
				card_limit: data.card_limit
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create list success",
				data: new ListDetail({
					id: list.id,
					name: list.name,
					background: list.background,
					card_limit: list.card_limit
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
				card_limit: list.card_limit,
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
				card_limit: list.card_limit,
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


	async moveList(filter: filterMoveList): Promise<ResponseData<ListDetail>> {
		try {
			// 1. Validate the list exists
			if (!filter.id || !isValidUUID(filter.id)) {
				return new ResponseData({
					status_code: StatusCodes.BAD_REQUEST,
					message: "List ID is invalid",
				});
			}
			
			// 2. Begin transaction
			return await db.transaction().execute(async (tx: Transaction<Database>) => {
				// Find the list
				const list = await tx
					.selectFrom('list')
					.where('id', '=', filter.id!)
					.selectAll()
					.executeTakeFirst();
				
				if (!list) {
					return new ResponseData({
						status_code: StatusCodes.NOT_FOUND,
						message: "List not found",
					});
				}
				
				// Get lists in the board to calculate new position
				const listsInBoard = await tx
					.selectFrom('list')
					.where('board_id', '=', list.board_id)
					.where('id', '!=', filter.id!) // Exclude the current list
					.orderBy('order', 'asc')
					.select(['id', 'order'])
					.execute();
				
				let newOrder: number;
				
				// If target position is at the end or beyond lists length
				if (filter.target_position === undefined ||
						filter.target_position >= listsInBoard.length) {
					// If moving to end, add 10000 to last list's order
					newOrder = listsInBoard.length > 0
						? listsInBoard[listsInBoard.length - 1].order + 10000
						: 10000;
				}
				// If target position is at the beginning
				else if (filter.target_position === 0) {
					// Place at half of first list's order or 5000 if very low
					newOrder = listsInBoard.length > 0
						? Math.max(listsInBoard[0].order / 2, 5000)
						: 10000;
				}
				// If target position is in the middle
				else {
					const prevList = listsInBoard[filter.target_position - 1];
					const nextList = listsInBoard[filter.target_position];
					
					// Calculate a value between the two lists
					const gap = nextList.order - prevList.order;
					if (gap < 1000) {
						// Weighted calculation for small gaps
						newOrder = prevList.order + 500;
					} else {
						// Standard midpoint calculation when gap is large enough
						newOrder = Math.floor((prevList.order + nextList.order) / 2);
					}
				}
				
				// Update the list with new order
				await tx
					.updateTable('list')
					.set({ order: newOrder })
					.where('id', '=', filter.id!)
					.execute();
				
				const updatedList = await tx
					.selectFrom('list')
					.where('id', '=', filter.id!)
					.selectAll()
					.executeTakeFirst();
				
				return new ResponseData({
					status_code: StatusCodes.OK,
					message: "List moved successfully",
					data: new ListDetail({
						id: updatedList!.id,
						name: updatedList!.name,
						background: updatedList!.background,
						order: updatedList!.order,
						board_id: updatedList!.board_id,
					})
				});
			});
		} catch (e) {
			console.error(e);
			if (e instanceof Error) {
				return new ResponseData({
					status_code: StatusCodes.INTERNAL_SERVER_ERROR,
					message: e.message
				});
			}
			return new ResponseData({
				status_code: StatusCodes.INTERNAL_SERVER_ERROR,
				message: "An unexpected error occurred"
			});
		}
	}

	async getMaxListOrderInBoard(board_id: string): Promise<number> {
		const result = await db
			.selectFrom('list')
			.select((eb) => eb.fn.max('order').as('max_order'))
			.where('board_id', '=', board_id)
			.executeTakeFirst();

		return result?.max_order ?? 0;
	}
}