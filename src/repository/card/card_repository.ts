import { validate as isValidUUID, v4 as uuidv4 } from 'uuid';

import {filterCardDetail, CardDetail, CardDetailUpdate, CardRepositoryI, CardActionActivity, CardComment, CardActivity, CardActivityMoveList, filterMoveCard} from "@/repository/card/card_interfaces";
import Card from "@/database/schemas/card";
import {Error, Op} from "sequelize";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {isFilterEmpty, Paginate} from "@/utils/data_utils";
import db from '@/database';
import { Database } from '@/types/database';
import { ExpressionBuilder, Transaction, sql } from 'kysely';
import { CardActionValue } from '@/types/custom_field';

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

	createKyFilter(eb: ExpressionBuilder<Database, any>, filter: filterCardDetail) {
		let query = eb.and([]); // Inisialisasi sebagai kondisi AND kosong
		
		if (filter.id) query = eb.and([query, eb('id', '=', filter.id)]);
		if (filter.name) query = eb.and([query, eb('name', '=', filter.name)]);
		if (filter.list_id) query = eb.and([query, eb('list_id', '=', filter.list_id)]);
	
		// OR conditions
		const orConditions = [];
		if (filter.__orId) orConditions.push(eb('id', '=', filter.__orId));
		if (filter.__orName) orConditions.push(eb('name', '=', filter.__orName));
		if (filter.__orListId) orConditions.push(eb('list_id', '=', filter.__orListId));
	
		if (orConditions.length > 0) {
			query = eb.and([query, eb.or(orConditions)]);
		}
	
		// NOT conditions
		const notConditions = [];
		if (filter.__notId) notConditions.push(eb('id', '!=', filter.__notId));
		if (filter.__notName) notConditions.push(eb('name', '!=', filter.__notName));
		if (filter.__notListId) notConditions.push(eb('workspace_id', '!=', filter.__notListId));
	
		if (notConditions.length > 0) {
			query = eb.and([query, ...notConditions]);
		}
	
		return query;
	}

	async getTotalCardInList(list_id: string): Promise<ResponseData<number>> {
		let total = await db.selectFrom("card").
			where("card.list_id", "=", list_id).
			select(({ fn }) => fn.count<number>("card.id").
			as('total')).executeTakeFirst();
		return new ResponseData({
			message: "Ok",
			status_code: StatusCodes.OK,
			data: total?.total!
		})
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
			const filterData = this.createFilter(filter);
			if (isFilterEmpty(filterData)) {
				return {
					status_code: StatusCodes.BAD_REQUEST,
					message: "get detail card without filter is not allowed",
				}
			}
			const card = await Card.findOne({where: filterData});
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
				location: card?.location ?? ""
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
		let qry = db.selectFrom("card").where((eb) => this.createKyFilter(eb, filter));
		let total = await qry.select(({ fn }) => fn.count<number>("card.id").as('total')).executeTakeFirst();
		paginate.setTotal(total?.total!)
		
		let qryResult = await qry.selectAll().offset(paginate.getOffset()).limit(paginate.limit).orderBy("card.order asc").execute();
		qryResult.map((raw: CardDetail) => {
			result.push(new CardDetail({
				id: raw.id,
				name: raw.name,
				description: raw.description,
				order: raw.order, 
				list_id: raw.list_id,
        location: raw.location ?? "",
				created_at: raw?.created_at || undefined,
				updated_at: raw?.updated_at || undefined,
			}))
		});

		return new ResponseListData({
			status_code: StatusCodes.OK,
			message: "card card",
			data: result,
		}, paginate)
	}

	async updateCard(filter: filterCardDetail, data: CardDetailUpdate): Promise<number> {
		try {
			const filterData = this.createFilter(filter);
			if (isFilterEmpty(filterData)) {
				return StatusCodes.NOT_FOUND
			}
			const effected= await Card.update(data.toObject(), {where: filterData});
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

	async addActivity(filter: filterCardDetail, data: CardActivity): Promise<ResponseData<CardActivity>> {
		let card = await this.getCard(filter)
		if (card.status_code != StatusCodes.OK) {
			return new ResponseData({
				status_code: card.status_code,
				message: card.message,
			});
		}

		if(data.action && data.action instanceof CardActionActivity) {
			let item: CardActionActivity = data.action as CardActionActivity
			const trx = await db.transaction().execute(async (tx: Transaction<Database>) => {
				const card_activiy = await tx
					.insertInto('card_activity')
					.values({
						id: uuidv4(),
						activity_type: data.activity_type,
						card_id: data.card_id,
						sender_user_id: data.sender_id,
					})
					.returning(['id'])
					.executeTakeFirst();
	
				await tx
					.insertInto('card_activity_action')
					.values({
						id: uuidv4(),
						// action: item.action_type,
						activity_id: card_activiy?.id!,
						source: item.source
					})
					.executeTakeFirst();
	
				return new ResponseData({
					status_code: StatusCodes.OK,
					message: "card detail",
					data: new CardActivity({
						id: card_activiy?.id!,
						card_id: data.card_id,
						sender_id: data.sender_id,
					}, item)
				});
			})
			return trx
		}else if(data.comment && data.comment instanceof CardComment) {
			let item: CardComment = data.comment as CardComment
			const trx = await db.transaction().execute(async (tx: Transaction<Database>) => {
				const card_activiy = await tx
					.insertInto('card_activity')
					.values({
						id: uuidv4(),
						activity_type: data.activity_type,
						card_id: data.card_id,
						sender_user_id: data.sender_id,
					})
					.returning(['id'])
					.executeTakeFirst();
	
				await tx
					.insertInto('card_activity_text')
					.values({
						id: uuidv4(),
						activity_id: card_activiy?.id!,
						text: item.text
					})
					.executeTakeFirst();
	
				return new ResponseData({
					status_code: StatusCodes.OK,
					message: "card detail",
					data: new CardActivity({
						id: card_activiy?.id!,
						card_id: data.card_id,
						sender_id: data.sender_id,
					}, item)
				});
			})
			return trx
		}else {
			return new ResponseData({
				status_code: StatusCodes.INTERNAL_SERVER_ERROR,
				message: "data not support",
			});
		}
	}

	async getCardActivities(card_id: string, paginate: Paginate): Promise<ResponseListData<CardActivity[]>> {
		const result: CardActivity[] = [];

		const total = await db
			.selectFrom('card_activity')
			.where('card_id', '=', card_id)
			.select(({ fn }) => fn.count<number>('id').as('count'))
			.executeTakeFirst();
	
		paginate.setTotal(total?.count ?? 0);

	
		const activities = await db
			.selectFrom('card_activity as ca')
			.leftJoin('card_activity_action as caa', 'ca.id', 'caa.activity_id')
			.leftJoin('card_activity_text as cat', 'ca.id', 'cat.activity_id')
			.where('ca.card_id', '=', card_id)
			.select([
				sql<string>`ca.id`.as('activity_id'),
				// sql<CardActionType>`ca.activity_type`.as('activity_type'),
				sql<string>`ca.card_id`.as('card_id'),
				sql<string>`ca.sender_user_id`.as('sender_id'),
				sql<string>`caa.action`.as('action_type'),
				sql<CardActionValue>`caa.source`.as('source'),
				sql<string>`cat.text`.as('text'),
				sql<string>`"ca"."created_at"`.as('xcreated_at')
			])
			.orderBy('xcreated_at', 'desc')
			.offset(paginate.getOffset())
			.limit(paginate.limit)
			.execute();
	
		for (const row of activities) {
			const act = {
				id: row.activity_id,
				card_id: row.card_id,
				sender_id: row.sender_id,
			}
			if (row.action_type) {
				const action = new CardActionActivity({});
				// const action = new CardActionActivity({
				// 	action_type: row.action_type as CardActionType
				// });
				// if (row.action_type == CardActionType.MoveList){
				// 	action.setMoveListValue(row.source as MoveListValue);
				// }
				result.push(new CardActivity(act, action));
			} else if (row.text) {
				result.push(new CardActivity(act, new CardComment({ text: row.text })));
			}
		}
	
		return new ResponseListData({
			status_code: StatusCodes.OK,
			message: 'card activity list',
			data: result,
		}, paginate);
	}

	async getCardMoveListActivity(card_id: string, paginate: Paginate): Promise<ResponseListData<Array<CardActivityMoveList>>> {
		let result: Array<CardActivityMoveList> = [];

		const qry = db
			.selectFrom('card_activity_action as caa')
			.innerJoin('card_activity as ca', 'caa.activity_id', 'ca.id')
			.where('ca.card_id', '=', card_id)
			// .where('caa.action', '=', CardActionType.MoveList)

		const total = await qry.select(({ fn }) => fn.count<number>('id').as('count')).executeTakeFirst();
		paginate.setTotal(total?.count!);

		const results = await qry
			.select([
				sql<string>`caa.created_at`.as('xcreated_at'),
				sql<string>`(caa.source ->> 'origin_list_id')`.as('origin_list_id'),
				sql<string>`(caa.source ->> 'destination_list_id')`.as('destination_list_id'),
			])
			.orderBy('xcreated_at', 'asc')
			.offset(paginate.getOffset())
			.limit(paginate.limit)
			.execute();

		for (const row of results) {
			const date_selected = new Date(row.xcreated_at);
			const formatted = date_selected.toLocaleString('id-ID', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
			result.push({date: formatted, list_id: row.destination_list_id})
		}

		return new ResponseListData({
			status_code: StatusCodes.OK,
			message: "card list history",
			data: result,
		}, paginate)
	}

	async moveCard(filter: filterMoveCard): Promise<ResponseData<CardDetail>> {
		try {
			// 1. Validate the card exists
			if (!filter.id || !isValidUUID(filter.id)) {
				return new ResponseData({
					status_code: StatusCodes.BAD_REQUEST,
					message: "Card ID is invalid",
				});
			}
	
			// 2. Begin transaction
			return await db.transaction().execute(async (tx: Transaction<Database>) => {
				// Find the card
				const card = await tx
					.selectFrom('card')
					.where('id', '=', filter.id!)
					.selectAll()
					.executeTakeFirst();
	
				if (!card) {
					return new ResponseData({
						status_code: StatusCodes.NOT_FOUND,
						message: "Card not found",
					});
				}
	
				// Check if this is a move within the same list or between lists
				const sourceListId = filter.previous_list_id || card.list_id;
				const targetListId = filter.target_list_id || card.list_id;
				const isSameList = sourceListId === targetListId;
	
				// Validate that both source and target lists exist
				if (!isSameList) {
					// Check that target list exists
					const targetList = await tx
						.selectFrom('list')
						.where('id', '=', targetListId)
						.select('id')
						.executeTakeFirst();
					
					if (!targetList) {
						return new ResponseData({
							status_code: StatusCodes.BAD_REQUEST,
							message: "Target list does not exist",
						});
					}
				}
	
				// Get cards in the target list to calculate position
				const cardsInTargetList = await tx
					.selectFrom('card')
					.where('list_id', '=', targetListId)
					.orderBy('order', 'asc')
					.select(['id', 'order'])
					.execute();
	
				// Calculate new order value
				let newOrder: number;
				
				// If target position is at the end or list is empty
				if (filter.target_position === undefined ||
						filter.target_position >= cardsInTargetList.length ||
						cardsInTargetList.length === 0) {
					// If list is empty or moving to end, use a higher value
					newOrder = cardsInTargetList.length > 0
						? cardsInTargetList[cardsInTargetList.length - 1].order + 1000
						: 1000;
				}
				// If target position is at the beginning
				else if (filter.target_position === 0) {
					newOrder = cardsInTargetList[0].order / 2;
				}
				// If target position is in the middle
				else {
					// Place between the two surrounding cards
					const prevCard = cardsInTargetList[filter.target_position - 1];
					const nextCard = cardsInTargetList[filter.target_position];
					newOrder = (prevCard.order + nextCard.order) / 2;
				}
	
				// Update the card with new list_id and order
				await tx
					.updateTable('card')
					.set({
						list_id: targetListId,
						order: newOrder
					})
					.where('id', '=', filter.id!)
					.execute();
	
				// Get updated card
				const updatedCard = await tx
					.selectFrom('card')
					.where('id', '=', filter.id!)
					.selectAll()
					.executeTakeFirst();
	
				return new ResponseData({
					status_code: StatusCodes.OK,
					message: "Card moved successfully",
					data: new CardDetail({
						id: updatedCard!.id,
						name: updatedCard!.name,
						description: updatedCard!.description,
						order: updatedCard!.order,
						list_id: updatedCard!.list_id,
						location: (updatedCard as any)?.location ?? ""
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
}