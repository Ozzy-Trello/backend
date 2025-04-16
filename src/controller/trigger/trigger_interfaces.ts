import { validate as isValidUUID } from 'uuid';

import { CustomFieldCardDetail } from "@/repository/custom_field/custom_field_interfaces"
import { filterTriggerDetail, TriggerDetail, TriggerDetailUpdate } from "@/repository/trigger/trigger_interfaces"
import { SourceType, TriggerValue } from "@/types/custom_field"
import { Paginate } from "@/utils/data_utils"
import { ResponseData, ResponseListData } from "@/utils/response_utils"

export interface TriggerControllerI {
  prepareDataSource(value: string | number, source_type: SourceType) : Promise<ResponseData<CustomFieldCardDetail>>
  doTrigger(trigger_id: string, value : string| number, trigger: TriggerValue): Promise<ResponseData<null>>
  checkConditionalValue(value : string| number, source_type: SourceType, trigger_value :TriggerValue): Promise<ResponseData<null>>

  CreateTrigger(data: TriggerCreateData): Promise<ResponseData<CreateTriggerResponse>>
	GetTrigger(filter: TriggerFilter): Promise<ResponseData<TriggerResponse>>
	GetListTrigger(filter: TriggerFilter, paginate: Paginate): Promise<ResponseListData<Array<TriggerResponse>>>
	DeleteTrigger(filter: TriggerFilter): Promise<ResponseData<null>>
	UpdateTrigger(filter: TriggerFilter, data: UpdateTriggerData): Promise<ResponseData<null>>
}


export class CreateTriggerResponse {
	id!: string;

	constructor(payload: Partial<CreateTriggerResponse>) {
		Object.assign(this, payload)
	}
}

export class TriggerResponse {
	id!: string;
	name?: string;
	description?: string;
	action!: TriggerValue;
	condition_value?: string

	constructor(payload: Partial<TriggerResponse>) {
		Object.assign(this, payload)
	}
}

export function fromTriggerDetailToTriggerResponse(data: TriggerDetail): TriggerResponse {
	return new TriggerResponse({
		id: data.id,
		name: data.name!,
		description: data.description,
		action: data.action,
		condition_value: data.condition_value
	})
}

export function fromTriggerDetailToTriggerResponseList(data: Array<TriggerDetail>): Array<TriggerResponse> {
	let result: Array<TriggerResponse> = [];
	for (const datum of data) {
		result.push(fromTriggerDetailToTriggerResponse(datum))
	}
	return result
}

export class UpdateTriggerData {
	name?: string;
	description?: string;
	background?: string;

	constructor(payload: Partial<UpdateTriggerData>) {
		Object.assign(this, payload)
		this.toTriggerDetailUpdate = this.toTriggerDetailUpdate.bind(this)
		this.isEmpty = this.isEmpty.bind(this)
	}

	isEmpty(): boolean{
		return this.name == undefined && this.description == undefined && this.background == undefined;
	}

	toTriggerDetailUpdate(): TriggerDetailUpdate {
		return new TriggerDetailUpdate({
			name: this.name,
			description: this.description,
		})
	}
}

export class TriggerFilter {
	id ?: string;
	name?: string;
	description?: string;
	workspace_id?: string;
	workspace_user_id_owner?: string;
	background?: string;

	constructor(payload: Partial<TriggerFilter>) {
		Object.assign(this, payload);
		this.isEmpty = this.isEmpty.bind(this)
		this.toFilterTriggerDetail = this.toFilterTriggerDetail.bind(this)
	}

	toFilterTriggerDetail(): filterTriggerDetail{
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			workspace_id: this.workspace_id,
			
		}
	}

	isEmpty(): boolean{
		return this.id == undefined && this.name == undefined && this.description == undefined && this.background == undefined;
	}
}


export class TriggerCreateData {
	name!: string;
	description?: string;
  // source?: SourceType;
	workspace_id!: string;
	action!: TriggerValue;
	condition_value?: string

	constructor(payload: Partial<TriggerCreateData>) {
		Object.assign(this, payload)
		this.toTriggerDetail = this.toTriggerDetail.bind(this);
		this.checkRequired = this.checkRequired.bind(this);
		this.getErrorField = this.getErrorField.bind(this);
		this.isEmptyAction = this.isEmptyAction.bind(this);
	}

	toTriggerDetail(): TriggerDetail {
		return new TriggerDetail({
			name: this.name,
			description: this.description,
			workspace_id: this.workspace_id,
			action: this.action,
			condition_value: this.condition_value,
		})
	}

	checkRequired(): string | null{
		if (this.workspace_id == undefined ) return 'workspace_id'
		if (this.action == undefined ) return 'action'
		return null
	} 

	getErrorField(): string | null {
		if (this.workspace_id && !isValidUUID(this.workspace_id!)) {
			return "'workspace_id' is not valid uuid"
		}
		if (this.action.target_list_id && !isValidUUID(this.action.target_list_id!)) {
			return "'target_list_id' is not valid uuid"
		}
    if (this.action.label_card_id && !isValidUUID(this.action.label_card_id!)) {
			return "'label_card_id' is not valid uuid"
		}
    if (this.action.label_card_id) return "'label_card_id' not support yet"
    if (this.action.message_telegram) return "'message_telegram' not support yet"
		return null
	}


  isEmptyAction(): boolean {
    let empty = true;
    if (this.action.label_card_id != undefined) empty = false
    if (this.action.target_list_id != undefined) empty = false
    if (this.action.message_telegram != undefined) empty = false
		return empty
	}
}