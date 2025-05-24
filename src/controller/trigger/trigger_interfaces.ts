import { validate as isValidUUID } from 'uuid';

import { CustomFieldCardDetail } from "@/repository/custom_field/custom_field_interfaces"
import { filterTriggerDetail, TriggerDetailUpdate } from "@/repository/trigger/trigger_interfaces"
import { ActionsValue, ActionType, ConditionType, SourceType, TriggerTypes } from "@/types/custom_field"
import { Paginate } from "@/utils/data_utils"
import { ResponseData, ResponseListData } from "@/utils/response_utils"
import { StatusCodes } from 'http-status-codes';
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

export function validateDataByGroupType(payload: any): string | undefined {
  let required = undefined
  if (payload.condition == undefined) {
    required = "condition"
  } else if (payload.type == undefined) {
    required = "type"
  } else if (payload.group_type == undefined) {
    required = "group_type"
  } else if (payload.workspace_id == undefined) {
    required = "workspace_id"
  } else if (payload.action == undefined) {
    required = "action"
  }
  if (required != undefined) {
    return "'" + required + "' is required"
  }

  if (!isValidUUID(payload.workspace_id!)) {
    return "not valid workspace id"
  }

  if(typeof payload.group_type != "string") {
    return "group_type should be string"
  }

  if(typeof payload.type != "string") {
    return "type should be string"
  }

  if(typeof payload.condition != "object" || Array.isArray(payload.condition)) {
    return "condition should be object"
  }

  let keys = Object.keys(payload.condition).sort();
  let expected_keys: any = [];

  switch(String(payload.group_type).toLowerCase()) {
    case TriggerTypes.CardMove: {
      switch(String(payload.type).toLowerCase()) {
        case ConditionType.CardInBoard: {
          expected_keys = ["board", "by", "action"].sort();
          break
        }
        case ConditionType.CardInList: {
          expected_keys = ["by", "list_id", "action"].sort();
          break
        }
        case ConditionType.ListAction:
        case ConditionType.CardAction: {
          expected_keys = ["by", "action"].sort();
          break
        }
        case ConditionType.ListHasCard: {
          expected_keys = ["list_id", "condition", "quantitative_comparison_operator", "quantity"].sort();
          break
        }
        default: {
          return `not support type`
        }
      }
      break
    }
    case TriggerTypes.CardChanges: {
      switch(String(payload.type).toLowerCase()) {
        case ConditionType.CardStatus: {
          expected_keys = ["status", "by"].sort();
          break
        }
        case ConditionType.LabelOnCard: {
          expected_keys = ["label_id", "by", "action"].sort();
          break
        }
        case ConditionType.AttachmentAdded:
        case ConditionType.MemberAdded: {
          expected_keys = ["by", "action"].sort();
          break
        }
        case ConditionType.UserInCardChange: {
          expected_keys = ["action", "by", "user_id"].sort();
          break
        }
        default: {
          return `not support type`
        }
      }
      break
    }
    case TriggerTypes.Date: {
      switch(String(payload.type).toLowerCase()) {
        case ConditionType.DueDateSet: {
          expected_keys = ["date_condition", "date", "by"].sort();
          break
        }
        case ConditionType.DateInCardName: {
          expected_keys = ["card_name", "card_desc", "card_name_or_desc", 
            "containing_or_start_with_or_ending_with","date"].sort();
          break
        }
        default: {
          return `not support type`
        }
      }
      break
    }
    case TriggerTypes.Checklist: {
      switch(String(payload.type).toLowerCase()) {
        case ConditionType.ChecklistOnCard:
        case ConditionType.ItemAdded: {
          expected_keys = ["label_id", "by", "action"].sort();
          break
        }
        case ConditionType.ChecklistCompleted: {
          expected_keys = ["label_id", "by", "status"].sort();
          break
        }
        case ConditionType.DueDateOnItem: {
          expected_keys = ["date"].sort();
          break
        }
        default: {
          return `not support type`
        }
      }
      break
    }
    case TriggerTypes.CardContent: {
      switch(String(payload.type).toLowerCase()) {
        case ConditionType.CardTextStart: {
          expected_keys = ["card_name", "card_desc", "card_name_or_desc", "start_with"].sort();
          break
        }
        case ConditionType.CommentPosted: {
          expected_keys = ["by"].sort();
          break
        }
        case ConditionType.MentionInComment: {
          expected_keys = ["user_id", "comment_id", "by"].sort();
          break
        }
        default: {
          return `not support type`
        }
      }
      break
    }
    case TriggerTypes.Field: {
      switch(String(payload.type).toLowerCase()) {
        case ConditionType.AllFieldsStatus: {
          expected_keys = ["status"].sort();
          break
        }
        case ConditionType.FieldsStatus: {
          expected_keys = ["custom_field", "status"].sort();
          break
        }
        case ConditionType.FieldSet:
        case ConditionType.FieldChecked:
        case ConditionType.FieldDateSet: {
          expected_keys = ["custom_field", "by"].sort();
          break
        }
        case ConditionType.FieldSetToValue: {
          expected_keys = ["custom_field", "value", "by"].sort();
          break
        }
        case ConditionType.FieldNumberCompare: {
          expected_keys = ["custom_field", "operator", "number", "by"].sort();
          break
        }
        default: {
          return `not support type`
        }
      }
      break
    }
    default : {
      return "group_type '" + payload.group_type + "' is not valid value"
    }
  }
  if (String(keys) !== String(expected_keys)) {
    return `we need ${expected_keys} condition for ${payload.type}`
  }

  if(payload.condition && payload.condition.board && !isValidUUID(payload.condition.board)) {
    return "invalid condition.board uuid"
  }
  if(payload.condition && payload.condition.board_id && !isValidUUID(payload.condition.board_id)) {
    return "invalid condition.board_id uuid"
  }
  if(payload.condition && payload.condition.list_id && !isValidUUID(payload.condition.list_id)) {
    return "invalid condition.list_id uuid"  
  }
  return undefined
}

export function validateAction(actions: Array<any>) : string | undefined {
  for (let index = 0; index < actions.length; index++) {
    let required = undefined;
    const action = actions[index];
    if(typeof action != "object" && !Array.isArray(action)) {
      return "items in action should be object"
    }

    if (action.type == undefined) {
      required = "type"
    } else if (action.group_type == undefined) {
      required = "group_type"
    } else if (action.condition == undefined) {
      required = "condition"
    }
    if (required != undefined) {
      return "'" + required + "' is required in action items"
    }

    if(typeof action.condition != "object" || Array.isArray(action.condition)) {
      return "action.condition should be object"
    }

    switch(action.group_type) {
      case TriggerTypes.CardMove: {
        switch(String(action.type).toLowerCase()) {
          case ActionType.Move: {
            let required = undefined;
            if(action.condition.action == undefined) {
              return "action.condition.action is required"
            }

            if (typeof action.condition.action != "string") {
              return required + " should be string"
            }

            if (!["move", "copy"].includes(action.condition.action)) {
              return "action.condition.action not valid value"
            } else if (!["top_of_list"].includes(action.condition.position)) {
              return "action.condition.action not valid value"
            }

            if (action.condition.board_id && !isValidUUID(action.condition.board_id)) {
              return "invalid uuid in action.condition.board_id"
            }

            if (action.condition.list_id && !isValidUUID(action.condition.list_id)) {
              return "invalid uuid in action.condition.list_id"
            }

            break
          }
          default: {
            return "action.type not valid value"
          }
        }
      }
    }
  }
  return
}

export function createTriggerCreateData(body: any): ResponseData<TriggerCreateData> {
  const errorsDataByGroupType = validateDataByGroupType(body);
  if(errorsDataByGroupType) {
    return new ResponseData({
      message: errorsDataByGroupType,
      status_code: StatusCodes.BAD_REQUEST,
    })
  }
  
  if(!Array.isArray(body.action)) {
    return new ResponseData({
      message: "action should be array",
      status_code: StatusCodes.BAD_REQUEST,
    })
  }

  const errorAction = validateAction(body.action);
  if(errorAction) {
    return new ResponseData({
      message: errorAction,
      status_code: StatusCodes.BAD_REQUEST,
    })
  }

  const res =  new TriggerCreateData({
    workspace_id:  body.workspace_id,
    group_type: body.group_type,
    type: body.type,
    condition: body.condition,
    action: body.action,
  })
  if (body.filter) {
    res.filter = body.filter;
  }

  return new ResponseData({
    data: res,
    message: "success",
    status_code: StatusCodes.OK
  })
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
