import Card from "@/database/schemas/card";
import {Error} from "sequelize";
import {ResponseData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {CardDetail, CardDetailUpdate, CardRepositoryI, filterCardDetail} from "@/repository/card/card_interfaces";

export class CardRepository implements CardRepositoryI {
	createFilter(filter: filterCardDetail) : any {
		const whereClause: any = {};
		if (filter.id) whereClause.id = filter.id;
		if (filter.list_id) whereClause.list_id = filter.list_id;
		if (filter.name) whereClause.name = filter.name;
		if (filter.description) whereClause.description = filter.description;
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
			let card = await Card.create({
				list_id: data.list_id!,
				name: data.name!,
				description: data.description!,
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create card success",
				data: new CardDetail({
					id: card.id,
					list_id: data.list_id!,
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

	async getCard(filter: filterCardDetail): Promise<ResponseData<CardDetail>> {
		try {
			const card = await Card.findOne({where: this.createFilter(filter)});
			if (!card) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "card is not found",
				}
			}
			let result = new CardDetail({
				id: card.id,
				list_id: card.list_id!,
				name: card.name!,
				description: card.description!,
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

	async getCardList(filter: filterCardDetail): Promise<Array<CardDetail>> {
		const cards = await Card.findAll({where: this.createFilter(filter)});
		return cards.map(card => card.toJSON() as unknown as CardDetail);
	}

	async updateCard(filter: filterCardDetail, data: CardDetailUpdate): Promise<number> {
		try {
			await Card.update(data.toObject(), {where: this.createFilter(filter)});
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}
}