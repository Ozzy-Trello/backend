import { validate as isValidUUID } from 'uuid';

import {filterCardDetail, CardDetail, CardDetailUpdate, CardRepositoryI} from "@/repository/card/card_interfaces";
import Card from "@/database/schemas/card";
import {Error, Op} from "sequelize";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {Paginate} from "@/utils/data_utils";

export class CardRepository implements CardRepositoryI {
	createFilter(filter: filterCardDetail): any {
		const whereClause: any = {};
		const orConditions: any[] = [];
		const notConditions: any[] = [];

		if (filter.id) whereClause.id = filter.id;
		if (filter.name) whereClause.name = filter.name;
		if (filter.list_id) whereClause.list_id = filter.list_id;
	
		if (filter.__orId) orConditions.push({ id: filter.__orId });
		if (filter.__orName) orConditions.push({ name: filter.__orName });
		if (filter.__orListId) orConditions.push({ list_id: filter.__orListId });

		if (filter.__notId) notConditions.push({ id: filter.__notId });
		if (filter.__notName) notConditions.push({ name: filter.__notName });
		if (filter.__notListId) notConditions.push({ list_id: filter.__notListId });

		if (notConditions.length > 0) {
			whereClause[Op.not] = notConditions;
		}

		if (orConditions.length > 0) {
			whereClause[Op.or] = orConditions;
		}
		return whereClause
	}

	async deleteCard(filter: filterCardDetail): Promise<number> {
		try {
			const card = await Card.destroy({where: this.createFilter(filter)});
			if (card <= 0) {
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

	async createCard(data: CardDetail): Promise<ResponseData<CardDetail>> {
		try {
			const card = await Card.create({
				name: data.name!,
				list_id: data.list_id!,
				description: data.list_id,
				order: data.order!
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create card success",
				data: new CardDetail({
					id: card.id,
					name: card.name,
					description: card.description,
					order: card.order
				})
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getCard(filter: filterCardDetail): Promise<ResponseData<CardDetail>> {
		try {
			if (filter.id && !isValidUUID(filter.id)) {
				return {
					status_code: StatusCodes.BAD_REQUEST,
					message: "card id is not valid uuid",
				}
			}
			const card = await Card.findOne({where: this.createFilter(filter)});
			if (!card) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "card is not found",
				}
			}
			let result = new CardDetail({
				id: card.id,
				name: card.name,
				description: card.description,
				order: card.order,
				list_id: card.list_id,
			})

			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "card detail",
				data: result,
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getListCard(filter: filterCardDetail, paginate: Paginate): Promise<ResponseListData<Array<CardDetail>>> {
		let result: Array<CardDetail> = [];
		paginate.setTotal(await Card.count({where: this.createFilter(filter)}))
		const lists = await Card.findAll({
			where: this.createFilter(filter),
			offset: paginate.getOffset(),
			limit: paginate.limit,
		});
		for (const card of lists) {
			result.push(new CardDetail({
				id: card.id,
				name: card.name,
				description: card.description, 
				order: card.order, 
				list_id: card.list_id,
			}))
		}
		return new ResponseListData({
			status_code: StatusCodes.OK,
			message: "card card",
			data: result,
		}, paginate)
	}

	async updateCard(filter: filterCardDetail, data: CardDetailUpdate): Promise<number> {
		try {
			const effected= await Card.update(data.toObject(), {where: this.createFilter(filter)});
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