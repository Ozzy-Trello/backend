import { ExpressionBuilder } from 'kysely';
import {v4 as uuidv4} from 'uuid';

import {filterTriggerDetail, TriggerDetail, TriggerDetailUpdate, TriggerRepositoryI} from "@/repository/trigger/trigger_interfaces";
import {Error} from "sequelize";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {Paginate} from "@/utils/data_utils";
import db from "@/database";
import { Database } from '@/types/database';

export class TriggerRepository implements TriggerRepositoryI {
	createFilter(eb: ExpressionBuilder<Database, any>, filter: filterTriggerDetail) {
		let query = eb.and([]); // Inisialisasi sebagai kondisi AND kosong
		
		if (filter.id) query = eb.and([query, eb('id', '=', filter.id)]);
		if (filter.name) query = eb.and([query, eb('name', '=', filter.name)]);
		if (filter.workspace_id) query = eb.and([query, eb('workspace_id', '=', filter.workspace_id)]);
	
		// OR conditions
		const orConditions = [];
		if (filter.__orId) orConditions.push(eb('id', '=', filter.__orId));
		if (filter.__orName) orConditions.push(eb('name', '=', filter.__orName));
		if (filter.__orWorkspaceId) orConditions.push(eb('workspace_id', '=', filter.__orWorkspaceId));
	
		if (orConditions.length > 0) {
			query = eb.and([query, eb.or(orConditions)]);
		}
	
		// NOT conditions
		const notConditions = [];
		if (filter.__notId) notConditions.push(eb('id', '!=', filter.__notId));
		if (filter.__notName) notConditions.push(eb('name', '!=', filter.__notName));
		if (filter.__notWorkspaceId) notConditions.push(eb('workspace_id', '!=', filter.__notWorkspaceId));
	
		if (notConditions.length > 0) {
			query = eb.and([query, ...notConditions]);
		}
	
		return query;
	}

	async createTrigger(data : TriggerDetail): Promise<ResponseData<TriggerDetail>> {
		try {
			let dataRes = {
				action: data.action,
				all_card: data.all_card!,
				workspace_id: data.workspace_id,
				condition_value: data.condition_value,
				description: data.description,
				id: uuidv4()
			}
			await db
				.insertInto('trigger')
				.values(dataRes)
				.execute();
		
			return new ResponseData({
				status_code: StatusCodes.CREATED,
				message: "create trigger success",
				data: new TriggerDetail(dataRes)
			})
		} catch (e) {
			return new ResponseData({
				status_code: StatusCodes.INTERNAL_SERVER_ERROR,
				message: e instanceof Error ? e.message : String(e),
			})
		}
	}

	async deleteTrigger(filter: filterTriggerDetail): Promise<number> {
		try {
			const result = await db
				.deleteFrom('trigger')
				.where((eb) => this.createFilter(eb, filter))
				.executeTakeFirst();
		
			if (!result.numDeletedRows || result.numDeletedRows <= 0) {
					return StatusCodes.NOT_FOUND;
			}
			return StatusCodes.NO_CONTENT;
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			console.log(msg)
			return StatusCodes.INTERNAL_SERVER_ERROR
		}
	}

	async getTrigger(filter: filterTriggerDetail): Promise<ResponseData<TriggerDetail>> {
		try {
				const trigger = await db
					.selectFrom('trigger')
					.selectAll()
					.where((eb) => this.createFilter(eb, filter))
					.executeTakeFirst();
				
				if (!trigger) {
						return { status_code: StatusCodes.NOT_FOUND, message: "trigger is not found" };
				}
				
				return new ResponseData({
						status_code: StatusCodes.OK,
						message: "trigger detail",
						data: new TriggerDetail(trigger)
				});
		} catch (e) {
			return new ResponseData({
				status_code: StatusCodes.INTERNAL_SERVER_ERROR,
				message: e instanceof Error ? e.message : String(e),
			})
		}
	}

	async getListTrigger(filter: filterTriggerDetail, paginate: Paginate): Promise<ResponseListData<Array<TriggerDetail>>> {
		try {
			const total = await db
				.selectFrom('trigger')
				.select(({ fn }) => fn.count<number>('id').as('count'))
				.where((eb) => this.createFilter(eb, filter))
				.executeTakeFirst();
			paginate.setTotal(total?.count!);
			
			const lists = await db
				.selectFrom('trigger')
				.selectAll()
				.where((eb) => this.createFilter(eb, filter))
				.offset(paginate.getOffset())
				.limit(paginate.limit)
				.execute();
			
			return new ResponseListData({
					status_code: StatusCodes.OK,
					message: "trigger list",
					data: lists.map((item) => new TriggerDetail(item))
			}, paginate);
		} catch (e) {
			return new ResponseListData({
				status_code: StatusCodes.INTERNAL_SERVER_ERROR,
				message: e instanceof Error ? e.message : String(e),
			}, paginate)
		}
	}

	async updateTrigger(filter: filterTriggerDetail, data: TriggerDetailUpdate): Promise<number> {
		try {
				const result = await db
					.updateTable('trigger')
					.set(data.toObject())
					.where((eb) => this.createFilter(eb, filter))
					.executeTakeFirst();
				
				if (!result.numUpdatedRows || result.numUpdatedRows <= 0) {
						return StatusCodes.NOT_FOUND;
				}
				return StatusCodes.NO_CONTENT;
		} catch (e) {
				const msg = e instanceof Error ? e.message : String(e)
				console.log(msg)
				return StatusCodes.INTERNAL_SERVER_ERROR
		}
	}
}