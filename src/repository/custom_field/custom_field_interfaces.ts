import { validate as isValidUUID } from 'uuid';
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import { ActionsValue, ConditionType, SourceType, TriggerTypes } from "@/types/custom_field";
import { AutomationCondition } from '@/types/trigger';

export interface CustomFieldRepositoryI {
  getCustomField(filter: filterCustomFieldDetail): Promise<ResponseData<CustomFieldDetail>>;
  createCustomField(data: CustomFieldDetail): Promise<ResponseData<CustomFieldDetail>>;
  deleteCustomField(filter: filterCustomFieldDetail): Promise<number>;
  updateCustomField(filter: filterCustomFieldDetail, data: CustomFieldDetailUpdate): Promise<number>;
  getListCustomField(filter: filterCustomFieldDetail, paginate: Paginate): Promise<ResponseListData<Array<CustomFieldDetail>>>;

  getCustomValue(filter: filterCustomValueDetail): Promise<ResponseData<CustomValueDetail>>;
  createCustomValue(data: CustomValueDetail): Promise<ResponseData<CustomValueDetail>>;
  deleteCustomValue(filter: filterCustomValueDetail): Promise<number>;
  updateCustomValue(filter: filterCustomValueDetail, data: CustomValueDetailUpdate): Promise<number>;
  getListCustomValue(filter: filterCustomValueDetail, paginate: Paginate): Promise<ResponseListData<Array<CustomValueDetail>>>;

  assignToCard(id: string, payload: CustomFieldCardDetail): Promise<number>;
  unAssignFromCard(id: string, card_id: string): Promise<number>;
  getListAssignCard(card_id: string, paginate: Paginate): Promise<ResponseListData<Array<AssignCardDetail>>>;
  getAssignCard(id: string, card_id: string): Promise<ResponseData<CardCustomFieldDetail>>;
  updateAssignedCard(id: string, card_id: string, value: CustomFieldCardDetail): Promise<number>;

  assignAllBoardCustomFieldToCard(board_id: string, card_id: string): Promise<ResponseData<null>>;
  unAssignAllBoardCustomFieldFromCard(board_id: string, card_id: string): Promise<ResponseData<null>>;
}

export interface filterCustomFieldDetail {
  id?: string;
  name?: string;
  description?: string;
  workspace_id?: string;
  trigger_id?: string;
  source?: SourceType;
  order?: number;

  __orId?: string;
  __orName?: string;
  __orDescription?: string;
  __orWorkspaceId?: string;
  // __orSource?: string;

  __notId?: string;
  __notName?: string;
  __notDescription?: string;
  __notWorkspaceId?: string;
  // __notSource?: string;
}

export class CustomFieldDetailUpdate {
  public name?: string;
  public description?: string;
  public order?: number;
  public trigger_id?: string;

  constructor(payload: Partial<CustomFieldDetailUpdate>) {
    Object.assign(this, payload);
    this.toObject = this.toObject.bind(this)
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    if (this.order) data.order = this.order;
    if (this.trigger_id) data.trigger_id = this.trigger_id;
    return data
  }
}

export class CustomFieldTrigger {
  public condition!: AutomationCondition;
  public condition_type!: ConditionType;
  public group_type!: TriggerTypes;
  public name?: string;
  public description?: string;
  public action!: ActionsValue[];
  public all_card!: boolean;

  constructor(payload: Partial<CustomFieldTrigger>) {
    if (!payload.all_card) payload.all_card = true
    Object.assign(this, payload);
    this.getErrorField = this.getErrorField.bind(this);
    this.isEmptyAction = this.isEmptyAction.bind(this);
  }

  public getErrorField(): string | null {
    // if (this.action.target_list_id && !isValidUUID(this.action.target_list_id!)) {
		// 	return "'target_list_id' is not valid uuid"
		// }
    // if (this.action.label_card_id && !isValidUUID(this.action.label_card_id!)) {
		// 	return "'label_card_id' is not valid uuid"
		// }
    // if (this.action.label_card_id) return "'label_card_id' not support yet"
    // if (this.action.message_telegram) return "'message_telegram' not support yet"
		return null
	}

  isEmptyAction(): boolean {
    let empty = true;
    // if (this.action.label_card_id != undefined) empty = false
    // if (this.action.target_list_id != undefined) empty = false
    // if (this.action.message_telegram != undefined) empty = false
		return empty
	}
}

export interface _trigger {
  id?: string;
  condition_value?: string;
  action?: ActionsValue;
}

export class CustomFieldDetail {
  public id!: string;
  public name?: string;
  public description!: string;
  public workspace_id!: string;
  public source!:  SourceType
  public trigger?: _trigger

  constructor(payload: Partial<CustomFieldDetail>) {
    Object.assign(this, payload);
  }
}

export class AssignCardDetail {
  public id!: string;
  public name!: string;
  public order?: number;
  public value?: string | number;
  public source!:  SourceType

  constructor(payload: Partial<AssignCardDetail>) {
    Object.assign(this, payload);
  }
}

export class CardCustomFieldDetail extends AssignCardDetail{
  public trigger_id?: string;

  constructor(payload: Partial<CardCustomFieldDetail>) {
    super(payload);
    Object.assign(this, payload);
  }
}

export class CustomFieldCardDetail {
  public order?: number;
  public card_id!: string;
  public value_user_id?: string;
  public value_string?: string;
  public value_number?: number;

  constructor(payload: Partial<CustomFieldCardDetail>) {
    Object.assign(this, payload);
    this.toObject = this.toObject.bind(this)
  }

  public toObject(): any {
    const data: any = {};
    if (this.order) data.order = this.order;
    if (this.card_id) data.card_id = this.card_id;
    if (this.value_user_id) data.value_user_id = this.value_user_id;
    if (this.value_string) data.value_string = this.value_string;
    if (this.value_number) data.value_number = this.value_number;
    return data
  }
}

export interface filterCustomValueDetail {
  id?: string;
  name?: string;
  description?: string;
  workspace_id?: string;
  source?: SourceType;
  order?: number;

  __orId?: string;
  __orName?: string;
  __orDescription?: string;
  __orWorkspaceId?: string;
  __orSource?: string;

  __notId?: string;
  __notName?: string;
  __notDescription?: string;
  __notWorkspaceId?: string;
  __notSource?: string;
}

export class CustomValueDetailUpdate {
  public name?: string;
  public description?: string;
  public order?: number;
  public trigger_id?: number;

  constructor(payload: Partial<CustomValueDetailUpdate>) {
    Object.assign(this, payload);
    this.toObject = this.toObject.bind(this)
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    if (this.order) data.order = this.order;
    if (this.trigger_id) data.trigger_id = this.trigger_id
    return data
  }
}

export class CustomValueDetail {
  public id!: string;
  public name?: string;
  public description!: string;
  public workspace_id!: string;
  public order!: number;
  public source!:  SourceType

  constructor(payload: Partial<CustomValueDetail>) {
    Object.assign(this, payload);
  }
}

export class CustomValueCardDetail {
  public order?: number;
  public card_id!: string;
  public value_user_id?: string;
  public value_string?: string;
  public value_number?: number;

  constructor(payload: Partial<CustomValueDetail>) {
    Object.assign(this, payload);
    this.toObject = this.toObject.bind(this)
  }

  public toObject(): any {
    const data: any = {};
    if (this.order) data.order = this.order;
    if (this.card_id) data.card_id = this.card_id;
    if (this.value_user_id) data.value_user_id = this.value_user_id;
    if (this.value_string) data.value_string = this.value_string;
    if (this.value_number) data.value_number = this.value_number;
    return data
  }
}
