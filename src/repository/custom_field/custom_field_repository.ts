import {filterCustomFieldDetail, CustomFieldDetail, CustomFieldDetailUpdate, CustomFieldRepositoryI} from "@/repository/custom_field/custom_field_interfaces";
import CustomField from "@/database/schemas/custom_field";
import {Error, Op} from "sequelize";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {Paginate} from "@/utils/data_utils";

export class CustomFieldRepository implements CustomFieldRepositoryI {
	createFilter(filter: filterCustomFieldDetail): any {
		const whereClause: any = {};
		const orConditions: any[] = [];
		const notConditions: any[] = [];

		if (filter.id) whereClause.id = filter.id;
		if (filter.name) whereClause.name = filter.name;
		if (filter.workspace_id) whereClause.workspace_id = filter.workspace_id;
	
		if (filter.__orId) orConditions.push({ id: filter.__orId });
		if (filter.__orName) orConditions.push({ name: filter.__orName });
		if (filter.__orWorkspaceId) orConditions.push({ workspace_id: filter.__orWorkspaceId });

		if (filter.__notId) notConditions.push({ id: filter.__notId });
		if (filter.__notName) notConditions.push({ name: filter.__notName });
		if (filter.__notWorkspaceId) notConditions.push({ workspace_id: filter.__notWorkspaceId });

		if (notConditions.length > 0) {
			whereClause[Op.not] = notConditions;
		}

		if (orConditions.length > 0) {
			whereClause[Op.or] = orConditions;
		}
		return whereClause
	}

	async deleteCustomField(filter: filterCustomFieldDetail): Promise<number> {
		try {
			const custom_field = await CustomField.destroy({where: this.createFilter(filter)});
			if (custom_field <= 0) {
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

	async createCustomField(data: CustomFieldDetail): Promise<ResponseData<CustomFieldDetail>> {
		try {
			const custom_field = await CustomField.create({
				name: data.name!,
				workspace_id: data.workspace_id!,
				description: data.workspace_id,
				order: data.order!,
				field_type: data.field_type
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create custom_field success",
				data: new CustomFieldDetail({
					id: custom_field.id,
					name: custom_field.name,
					description: custom_field.description,
					order: custom_field.order
				})
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getCustomField(filter: filterCustomFieldDetail): Promise<ResponseData<CustomFieldDetail>> {
		try {
			const custom_field = await CustomField.findOne({where: this.createFilter(filter)});
			if (!custom_field) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "custom_field is not found",
				}
			}
			let result = new CustomFieldDetail({
				id: custom_field.id,
				name: custom_field.name,
				description: custom_field.description,
				order: custom_field.order,
				workspace_id: custom_field.workspace_id,
			})

			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "custom_field detail",
				data: result,
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getListCustomField(filter: filterCustomFieldDetail, paginate: Paginate): Promise<ResponseListData<Array<CustomFieldDetail>>> {
		let result: Array<CustomFieldDetail> = [];
		paginate.setTotal(await CustomField.count({where: this.createFilter(filter)}))
		const lists = await CustomField.findAll({
			where: this.createFilter(filter),
			offset: paginate.getOffset(),
			limit: paginate.limit,
		});
		for (const custom_field of lists) {
			result.push(new CustomFieldDetail({
				id: custom_field.id,
				name: custom_field.name,
				description: custom_field.description, 
				order: custom_field.order, 
				workspace_id: custom_field.workspace_id,
			}))
		}
		return new ResponseListData({
			status_code: StatusCodes.OK,
			message: "custom_field custom_field",
			data: result,
		}, paginate)
	}

	async updateCustomField(filter: filterCustomFieldDetail, data: CustomFieldDetailUpdate): Promise<number> {
		try {
			const effected= await CustomField.update(data.toObject(), {where: this.createFilter(filter)});
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