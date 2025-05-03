import { validate as isValidUUID } from 'uuid';

import { CustomFieldCardDetail } from "@/repository/custom_field/custom_field_interfaces"
import { filterTriggerDetail, TriggerDetail, TriggerDetailUpdate } from "@/repository/trigger/trigger_interfaces"
import { ActionsValue, CardMoveActionTypes, ConditionType, SourceType, TriggerTypes } from "@/types/custom_field"
import { Paginate } from "@/utils/data_utils"
import { ResponseData, ResponseListData } from "@/utils/response_utils"
import { StatusCodes } from 'http-status-codes';
import { AutomationCondition } from '@/types/trigger';

export interface TriggerControllerI {
  prepareDataSource(value: string | number, source_type: SourceType) : Promise<ResponseData<CustomFieldCardDetail>>
  doTrigger(paylod: DoTriggerData): Promise<ResponseData<null>>
  // doTrigger(trigger_id: string, value : string| number, trigger: ActionsValue): Promise<ResponseData<null>>
  // checkConditionalValue(value : string| number, source_type: SourceType, trigger_value :ActionsValue[]): Promise<ResponseData<null>>

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

export function createTriggerCreateData(body: any): ResponseData<TriggerCreateData> {
  const res =  new TriggerCreateData({})
  { //check required
    let required = undefined
    if (body.condition == undefined) {
      required = "condition"
    } else if (body.type == undefined) {
      required = "type"
    } else if (body.group_type == undefined) {
      required = "group_type"
    } else if (body.workspace_id == undefined) {
      required = "workspace_id"
    } else if (body.action == undefined) {
      required = "action"
    }
    if (required != undefined) {
      return new ResponseData({
        message: "'" + required + "' is required",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
  }

  { // data validation
    if (!isValidUUID(body.workspace_id!)) {
      return new ResponseData({
        message: "not valid workspace id",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    res.workspace_id = body.workspace_id;

    if(typeof body.group_type != "string") {
      return new ResponseData({
        message: "group_type should be string",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    res.group_type = body.group_type;

    if(typeof body.type != "string") {
      return new ResponseData({
        message: "type should be string",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    res.type = body.type;

    if(typeof body.condition != "object" || Array.isArray(body.condition)) {
      return new ResponseData({
        message: "condition should be object",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    switch(String(body.group_type).toLowerCase()) {
      case TriggerTypes.CardMove: {
        let keys = Object.keys(body.condition).sort();
        let expected_keys: any = [];
        switch(String(body.type).toLowerCase()) {
          case ConditionType.CardInBoard: {
            // expected_keys = ["type", "by", "action"].sort();
            expected_keys = ["board", "by", "action"].sort();
            break
          }
          case ConditionType.CardInList: {
            expected_keys = ["type", "by", "id_list", "action"].sort();
            break
          }
          case ConditionType.CardAction: {
            expected_keys = ["type", "by", "action"].sort();
            break
          }
          case ConditionType.ListAction: {
            expected_keys = ["type", "by", "action"].sort();
            break
          }
          case ConditionType.ListHasCard: {
            expected_keys = ["type", "id_list", "condition"].sort();
            break
          }
          default: {
            return new ResponseData({
              status_code: StatusCodes.BAD_REQUEST,
              message: `not support condition`
            })
          }
        }
        if (String(keys) !== String(expected_keys)) {
          return new ResponseData({
            status_code: StatusCodes.BAD_REQUEST,
            message: `we need ${expected_keys} condition for ${body.type}`
          })
        }

        if(body.condition.board && !isValidUUID(body.condition.board)) {
          return new ResponseData({
            message: "invalid condition.board uuid",
            status_code: StatusCodes.BAD_REQUEST,
          })  
        }
        if(body.condition.board_id && !isValidUUID(body.condition.board_id)) {
          return new ResponseData({
            message: "invalid condition.board_id uuid",
            status_code: StatusCodes.BAD_REQUEST,
          })  
        }
        if(body.condition.list_id && !isValidUUID(body.condition.list_id)) {
          return new ResponseData({
            message: "invalid condition.list_id uuid",
            status_code: StatusCodes.BAD_REQUEST,
          })  
        }
        break
      }
      case TriggerTypes.CardChanges: {
        return new ResponseData({
          message: "group_type '" + body.group_type + "' is not valid value",
          status_code: StatusCodes.BAD_REQUEST,
        })
      }
      default : {
        return new ResponseData({
          message: "group_type '" + body.group_type + "' is not valid value",
          status_code: StatusCodes.BAD_REQUEST,
        })
      }
    }
    res.condition = body.condition;

    if(!Array.isArray(body.action)) {
      return new ResponseData({
        message: "action should be array",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    for (let index = 0; index < body.action.length; index++) {
      let required = undefined;
      const action = body.action[index];
      if(typeof action != "object" && !Array.isArray(action)) {
        return new ResponseData({
          message: "items in action should be object",
          status_code: StatusCodes.BAD_REQUEST,
        })
      }

      if (action.type == undefined) {
        required = "type"
      } else if (action.group_type == undefined) {
        required = "group_type"
      } else if (action.condition == undefined) {
        required = "condition"
      }
      if (required != undefined) {
        return new ResponseData({
          message: "'" + required + "' is required in action items",
          status_code: StatusCodes.BAD_REQUEST,
        })
      }

      if(typeof action.condition != "object" || Array.isArray(action.condition)) {
        return new ResponseData({
          message: "action.condition should be object",
          status_code: StatusCodes.BAD_REQUEST,
        })
      }

      switch(action.group_type) {
        case TriggerTypes.CardMove: {
          switch(String(action.type).toLowerCase()) {
            case CardMoveActionTypes.Move: {
              let required = undefined;
              if(action.condition.action == undefined) {
                return new ResponseData({
                  message: "action.condition.action is required",
                  status_code: StatusCodes.BAD_REQUEST,
                })
              } else if(action.condition.position == undefined) {
                return new ResponseData({
                  message: "action.condition.position is required",
                  status_code: StatusCodes.BAD_REQUEST,
                })
              }

              if (typeof action.condition.action != "string") {
                return new ResponseData({
                  message: required + " should be string",
                  status_code: StatusCodes.BAD_REQUEST,
                })
              } else if (typeof action.condition.position != "string") {
                return new ResponseData({
                  message: required + " should be string",
                  status_code: StatusCodes.BAD_REQUEST,
                })
              }

              if (!["move", "copy"].includes(action.condition.action)) {
                return new ResponseData({
                  message: "action.condition.action not valid value",
                  status_code: StatusCodes.BAD_REQUEST,
                })
              }else if (!["top_of_list"].includes(action.condition.position)) {
                return new ResponseData({
                  message: "action.condition.action not valid value",
                  status_code: StatusCodes.BAD_REQUEST,
                })
              }

              if (action.condition.board_id && !isValidUUID(action.condition.board_id)) {
                return new ResponseData({
                  message: "invalid uuid in action.condition.board_id",
                  status_code: StatusCodes.BAD_REQUEST,
                })
              }

              if (action.condition.list_id && !isValidUUID(action.condition.list_id)) {
                return new ResponseData({
                  message: "invalid uuid in action.condition.list_id",
                  status_code: StatusCodes.BAD_REQUEST,
                })
              }

              break
            }
            default: {
              return new ResponseData({
                message: "action.type not valid value",
                status_code: StatusCodes.BAD_REQUEST,
              })
            }
          }
        }
      }
    }
    res.action = body.action;
  }

  if (body.filter) {
    res.filter = body.filter;
  }

  return new ResponseData({
    data: res,
    message: "success",
    status_code: StatusCodes.OK
  })
}

// export class TriggerCreateData {
// 	name!: string;
// 	description?: string;
//   // source?: SourceType;
// 	workspace_id!: string;
// 	action!: TriggerValue;
// 	condition_value?: string

// 	constructor(payload: Partial<TriggerCreateData>) {
// 		Object.assign(this, payload)
// 		this.toTriggerDetail = this.toTriggerDetail.bind(this);
// 		this.checkRequired = this.checkRequired.bind(this);
// 		this.getErrorField = this.getErrorField.bind(this);
// 		this.isEmptyAction = this.isEmptyAction.bind(this);
// 	}

// 	toTriggerDetail(): TriggerDetail {
// 		return new TriggerDetail({
// 			name: this.name,
// 			description: this.description,
// 			workspace_id: this.workspace_id,
// 			action: this.action,
// 			condition_value: this.condition_value,
// 		})
// 	}

// 	checkRequired(): string | null{
// 		if (this.workspace_id == undefined ) return 'workspace_id'
// 		if (this.action == undefined ) return 'action'
// 		return null
// 	} 

// 	getErrorField(): string | null {
// 		if (this.workspace_id && !isValidUUID(this.workspace_id!)) {
// 			return "'workspace_id' is not valid uuid"
// 		}
// 		if (this.action.target_list_id && !isValidUUID(this.action.target_list_id!)) {
// 			return "'target_list_id' is not valid uuid"
// 		}
//     if (this.action.label_card_id && !isValidUUID(this.action.label_card_id!)) {
// 			return "'label_card_id' is not valid uuid"
// 		}
//     if (this.action.label_card_id) return "'label_card_id' not support yet"
//     if (this.action.message_telegram) return "'message_telegram' not support yet"
// 		return null
// 	}


//   isEmptyAction(): boolean {
//     let empty = true;
//     if (this.action.label_card_id != undefined) empty = false
//     if (this.action.target_list_id != undefined) empty = false
//     if (this.action.message_telegram != undefined) empty = false
// 		return empty
// 	}
// }

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
