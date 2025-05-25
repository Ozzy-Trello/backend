import { CustomFieldCardDetail } from "@/repository/custom_field/custom_field_interfaces"
import { filterTriggerDetail, TriggerDetailUpdate } from "@/repository/trigger/trigger_interfaces"
import { ActionsValue, ConditionType, SourceType, TriggerTypes } from "@/types/custom_field"
import { Paginate } from "@/utils/data_utils"
import { ResponseData, ResponseListData } from "@/utils/response_utils"
import { AutomationCondition } from '@/types/trigger';
import { TriggerDoData } from '../card/card_interfaces';

export interface TriggerControllerI {
  prepareDataSource(value: string | number, source_type: SourceType) : Promise<ResponseData<CustomFieldCardDetail>>
  doTrigger(paylod: TriggerDoData): Promise<ResponseData<null>>
  
  CreateTrigger(data: TriggerCreateData): Promise<ResponseData<CreateTriggerResponse>>
	GetTrigger(filter: TriggerFilter): Promise<ResponseData<TriggerResponse>>
	GetListTrigger(filter: TriggerFilter, paginate: Paginate): Promise<ResponseListData<Array<TriggerResponse>>>
	DeleteTrigger(filter: TriggerFilter): Promise<ResponseData<null>>
	UpdateTrigger(filter: TriggerFilter, data: UpdateTriggerData): Promise<ResponseData<null>>
}

export interface DoTriggerData {
  action?: ConditionType
  by?: string[]
  target?: {
    board_id?: string[]
  }
  our_data?: {
    user_id?: string
    card_id?: string;
  }
  filter?: any
  condition?: {
    action: string
    board: string
    by: string
  }
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
	action!: ActionsValue[];
	condition_value?: string

	constructor(payload: Partial<TriggerResponse>) {
		Object.assign(this, payload)
	}
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
  id?: string
  group_type!: TriggerTypes;
  type!: ConditionType;
  workspace_id!: string;
  condition!: AutomationCondition;
  action!: ActionsValue[];
  filter: any;

  constructor(payload: Partial<TriggerCreateData>) {
    Object.assign(this, payload);
  }
}
