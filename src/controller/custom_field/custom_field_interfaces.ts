import { validate as isValidUUID } from 'uuid';

import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import { CustomFieldDetail, CustomFieldDetailUpdate, filterCustomFieldDetail } from "@/repository/custom_field/custom_field_interfaces";
import { SourceType } from '@/types/custom_field';

export interface CustomFieldControllerI {
	CreateCustomField(user_id: string, data: CustomFieldCreateData): Promise<ResponseData<CreateCustomFieldResponse>>
	GetCustomField(filter: CustomFieldFilter): Promise<ResponseData<CustomFieldResponse>>
	GetListCustomField(filter: CustomFieldFilter, paginate: Paginate): Promise<ResponseListData<Array<CustomFieldResponse>>>
	DeleteCustomField(filter: CustomFieldFilter): Promise<ResponseData<null>>
	UpdateCustomField(filter: CustomFieldFilter, data: UpdateCustomFieldData): Promise<ResponseData<null>>
}

export class CreateCustomFieldResponse {
	id!: string;

	constructor(payload: Partial<CreateCustomFieldResponse>) {
		Object.assign(this, payload)
	}
}

export class CustomFieldResponse {
	id!: string;
	name?: string;
	description?: string;
	source?: SourceType;
	trigger_id?: string;

	constructor(payload: Partial<CustomFieldResponse>) {
		Object.assign(this, payload)
	}
}

export function fromCustomFieldDetailToCustomFieldResponse(data: CustomFieldDetail): CustomFieldResponse {
	return new CustomFieldResponse({
		id: data.id,
		name: data.name!,
		description: data.description,
		source: data.source,
		trigger_id: data.trigger_id,
	})
}

export function fromCustomFieldDetailToCustomFieldResponseCustomField(data: Array<CustomFieldDetail>): Array<CustomFieldResponse> {
	let result: Array<CustomFieldResponse> = [];
	for (const datum of data) {
		result.push(fromCustomFieldDetailToCustomFieldResponse(datum))
	}
	return result
}

export class UpdateCustomFieldData {
	name?: string;
	description?: string;
	workspace_id?: string;
	trigger_id?: string;
	order?: number;

	constructor(payload: Partial<UpdateCustomFieldData>) {
		Object.assign(this, payload)
		this.toCustomFieldDetailUpdate = this.toCustomFieldDetailUpdate.bind(this)
		this.isEmpty = this.isEmpty.bind(this)
		this.getErrorfield = this.getErrorfield.bind(this)
	}

	isEmpty(): boolean{
		return this.name == undefined && this.description == undefined;
	}

	toCustomFieldDetailUpdate(): CustomFieldDetailUpdate {
		return new CustomFieldDetailUpdate({
			name: this.name,
			description: this.description,
			trigger_id: this.trigger_id,
			order: this.order,
		})
	}

	getErrorfield(): string| null {
		if ( this.workspace_id && !isValidUUID(this.workspace_id)) {
			return "'workspace_id' is not valid uuid"
		}
		if (this.trigger_id && !isValidUUID(this.trigger_id)) {
			return "'trigger_id' is not valid uuid,"
		}
		return null
	}
}

export class CustomFieldFilter {
	id ?: string;
	name?: string;
	workspace_id?: string
	description?: string;
	source?: SourceType;
	trigger_id?: string;

	constructor(payload: Partial<CustomFieldFilter>) {
		Object.assign(this, payload);
		this.isEmpty = this.isEmpty.bind(this)
		this.toFilterCustomFieldDetail = this.toFilterCustomFieldDetail.bind(this)
		this.getErrorfield = this.getErrorfield.bind(this)
	}

	toFilterCustomFieldDetail(): filterCustomFieldDetail{
		return {
			id: this.id,
			name: this.name,
			workspace_id: this.workspace_id,
			source: this.source,
			description: this.description,
			trigger_id: this.trigger_id,
		}
	}

	isEmpty(): boolean{
		return this.id == undefined && 
		this.name == undefined && 
		this.workspace_id == undefined && 
		this.source == undefined && 
		this.description == undefined &&
		this.trigger_id == undefined
	}

	getErrorfield(): string| null {
		if ( this.id && !isValidUUID(this.id)) {
			return "'id' is not valid uuid"
		}
		if ( this.workspace_id && !isValidUUID(this.workspace_id)) {
			return "'workspace_id' is not valid uuid"
		}
		return null
	}
}


export class CustomFieldCreateData {
	name!: string;
	description?: string;
	workspace_id!: string;
	source!: SourceType;
	trigger_id?: string;

	constructor(payload: Partial<CustomFieldCreateData>) {
		Object.assign(this, payload)
		this.toCustomFieldDetail = this.toCustomFieldDetail.bind(this);
		this.checkRequired = this.checkRequired.bind(this);
		this.getErrorField = this.getErrorField.bind(this);
	}

	toCustomFieldDetail(): CustomFieldDetail {
		return new CustomFieldDetail({
			name: this.name,
			description: this.description,
			workspace_id: this.workspace_id,
			source: this.source,
			trigger_id: this.trigger_id
		})
	}

	checkRequired(): string | null{
		if (this.workspace_id == undefined ) return 'workspace_id'
		if (this.name == undefined ) return 'name'
		if (this.source == undefined ) return 'source'
		return null
	} 

	getErrorField(): string | null {
		if (this.workspace_id && !isValidUUID(this.workspace_id!)) {
			return "'workspace_id' is not valid uuid"
		}
		if(this.trigger_id && !isValidUUID(this.trigger_id)) {
			return "'trigger_id' is not valid uuid"
		}
		if (this.source && typeof this.source == "string" && !(this.source.toLowerCase() == "user" || this.source.toLowerCase() == "product" || this.source.toLowerCase() == "custom_value")) {
			return "'source' sould be 'user','product' or 'custom_value'"
		}
		return null
	}
}