import { validate as isValidUUID } from 'uuid';
import { BoardRepositoryI } from "@/repository/board/board_interfaces";
import { CardDetail, CardDetailUpdate, CardRepositoryI } from "@/repository/card/card_interfaces";
import { ListDetail, ListRepositoryI } from "@/repository/list/list_interfaces";
import { TriggerRepositoryI } from "@/repository/trigger/trigger_interfaces";
import { UserRepositoryI } from "@/repository/user/user_interfaces";
import { filterWorkspaceDetail, WorkspaceRepositoryI } from "@/repository/workspace/workspace_interfaces";
import { ResponseData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { TriggerDoData } from "../card/card_interfaces";
import { ZeroAsyncFunction } from "@/types/trigger";
import { ActionsValue, ActionType, CardChangesConfig, CardMoveConfig, ConditionType, CopyCondition, MoveCondition, EnumCustomFieldSource, TriggerTypes, UserActionCondition } from "@/types/custom_field";
import { CustomFieldCardDetail } from "@/repository/custom_field/custom_field_interfaces";
import { TriggerCreateData } from './trigger_interfaces';

export class Trigger {
  private workspace_repo: WorkspaceRepositoryI;
  private trigger_repo: TriggerRepositoryI;
  private card_repo: CardRepositoryI;
  private list_repo: ListRepositoryI;
  private user_repo: UserRepositoryI;
  private board_repo: BoardRepositoryI;

  constructor(workspace_repo: WorkspaceRepositoryI, trigger_repo: TriggerRepositoryI, card_repo: CardRepositoryI, list_repo: ListRepositoryI, user_repo: UserRepositoryI, board_repo: BoardRepositoryI) {
    this.workspace_repo = workspace_repo;
    this.trigger_repo = trigger_repo;
    this.card_repo = card_repo;
    this.list_repo = list_repo;
    this.user_repo = user_repo;
    this.board_repo = board_repo;
    
    this.CheckActionValue = this.CheckActionValue.bind(this);
    this.CheckConditionValue = this.CheckConditionValue.bind(this);
    this.DoTrigger = this.DoTrigger.bind(this);
    this.PrepareDataSource = this.PrepareDataSource.bind(this);
    
    this.buildTriggerActions = this.buildTriggerActions.bind(this);
    this.checkCardChangesTrigger = this.checkCardChangesTrigger.bind(this);
    this.checkCardMoveTrigger = this.checkCardMoveTrigger.bind(this);
    this.executeActions = this.executeActions.bind(this);
    this.validateCard = this.validateCard.bind(this);
  }

  // Helper: Eksekusi semua aksi
  private async executeActions(list_doing: ZeroAsyncFunction[]) {
    Promise.all(list_doing.map(fn => fn()));
  }

  // Helper: Validasi workspace
  private async validateWorkspace(workspace_id: string): Promise<ResponseData<any> | undefined> {
    const workspace = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail({id: workspace_id}));
    if (workspace.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: workspace.message,
        status_code: workspace.status_code,
      });
    }
    return undefined;
  }

  // Helper: Validasi card
  private async validateCard(card_id?: string): Promise<{card?: CardDetail, error?: ResponseData<null>}> {
    if (!card_id) return {};
    const selected_card = await this.card_repo.getCard({id: card_id});
    if (selected_card.status_code != StatusCodes.OK) {
      return { error: new ResponseData({
        message: selected_card.message,
        status_code: selected_card.status_code,
      })};
    }
    return { card: selected_card.data };
  }

  // Helper: Validasi list
  private async validateList(list_id?: string): Promise<{list?: ListDetail, error?: ResponseData<null>}> {
    if (!list_id) return {};
    const selected_list = await this.list_repo.getList({id: list_id});
    if (selected_list.status_code != StatusCodes.OK) {
      return { error: new ResponseData({
        message: selected_list.message,
        status_code: selected_list.status_code,
      })};
    }
    return { list: selected_list.data };
  }

  // Helper: Eksekusi aksi trigger
  private async buildTriggerActions(trigger: any, paylod: TriggerDoData, card_target?: CardDetail): Promise<ZeroAsyncFunction[]> {
    let list_doing: ZeroAsyncFunction[] = [];
    if (paylod.type === ConditionType.CardInBoard) {
      if (['added', 'created'].includes(paylod.condition.action)) {
        for (const selected_action of trigger.data!.action) {
          if (selected_action.condition.action == "move" && card_target) {
            let prev_next_list;
            if (selected_action.condition.list_id) {
              const selected_prev_next_list = await this.list_repo.getAdjacentListIds(card_target.list_id, selected_action.condition.list_id!);
              if (selected_prev_next_list.status_code == StatusCodes.OK) {
                prev_next_list = selected_prev_next_list.data;
              }
            }
            if (selected_action.condition.position == "top_of_list") {
              list_doing.push(async() => {
                const topOrder = await this.card_repo.newTopOrderCard(card_target.list_id);
                if (topOrder.status_code == StatusCodes.OK) {
                  await this.card_repo.updateCard({id: card_target.id}, new CardDetailUpdate({order: topOrder.data!}));
                }
              });
            } else if (selected_action.condition.position == "bottom_of_list") {
              list_doing.push(async() => {
                const bottomOrder = await this.card_repo.newBottomOrderCard(card_target.list_id);
                if (bottomOrder.status_code == StatusCodes.OK) {
                  await this.card_repo.updateCard({id: card_target.id}, new CardDetailUpdate({order: bottomOrder.data!}));
                }
              });
            }
            if (selected_action.condition.position == "next_list" && prev_next_list?.next_id) {
              list_doing.push(async() => {
                await this.card_repo.updateCard({id: card_target.id}, new CardDetailUpdate({list_id: prev_next_list.next_id!}));
              });
            } else if (selected_action.condition.position == "prev_list" && prev_next_list?.previous_id) {
              list_doing.push(async() => {
                await this.card_repo.updateCard({id: card_target.id}, new CardDetailUpdate({list_id: prev_next_list.previous_id!}));
              });
            }
          } else if (selected_action.condition.action == "copy" && card_target) {
            // Implementasi copy jika sudah siap
          }
        }
      }
    }
    return list_doing;
  }

  private async checkCardMoveTrigger(data: CardMoveConfig): Promise<ResponseData<null>> {
    let response: ResponseData<null> = new ResponseData({})
    switch(data.condition.action){
      case 'copy':{
        const x_data = data.condition as CopyCondition;
        if (x_data.board_id){
          const res = await this.board_repo.getBoard({id: String(x_data.board_id)});
          response.message = res.message;
          response.status_code = res.status_code;
          return response
        }
        if (x_data.list_id){
          const res = await this.list_repo.getList({id: String(x_data.list_id)});
          response.message = res.message;
          response.status_code = res.status_code;
          return response
        }
        break
      }
      case 'move':{
        const x_data = data.condition as MoveCondition;
        if (x_data.board_id){
          const res = await this.board_repo.getBoard({id: String(x_data.board_id)});
          response.message = res.message;
          response.status_code = res.status_code;
          return response
        }
        if (x_data.list_id){
          const res = await this.list_repo.getList({id: String(x_data.list_id)});
          response.message = res.message;
          response.status_code = res.status_code;
          return response
        }
        break
      }
    }
    return new ResponseData({
      message: "success",
      status_code: StatusCodes.OK,
    })
  }

  private async checkCardChangesTrigger(data: CardChangesConfig): Promise<ResponseData<null>> {
    let response: ResponseData<null> = new ResponseData({})
    switch(data.condition.action){
      case "user_action": {
        const x_data = data.condition as UserActionCondition;
        if(x_data.user_id){
          const res = await this.user_repo.getUser({id: String(x_data.user_id)});
          response.message = res.message;
          response.status_code = res.status_code;
          return response
        }
      }
    }
    return new ResponseData({
      message: "success",
      status_code: StatusCodes.OK,
    })
  }

  // Fungsi utama
  async DoTrigger(payload: TriggerDoData): Promise<ResponseData<null>> {
    // Validasi workspace
    const workspaceError = await this.validateWorkspace(payload.workspace_id);
    if (workspaceError) return workspaceError;

    // Validasi card
    let card_target: CardDetail | undefined;
    if (payload.data?.card_id) {
      const { card, error } = await this.validateCard(payload.data.card_id);
      if (error) return error;
      card_target = card;
    }

    // Validasi list
    let list_target: ListDetail | undefined;
    if (payload.data?.list_id) {
      const { list, error } = await this.validateList(payload.data.list_id);
      if (error) return error;
      list_target = list;
    }

    // Ambil trigger
    const trigger = await this.trigger_repo.getTrigger(payload);
    if (trigger.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: trigger.message,
        status_code: trigger.status_code,
      });
    }

    const errorsDataByGroupType = validateDataByGroupType(trigger.data!);
    if(errorsDataByGroupType) {
      return new ResponseData({
        message: errorsDataByGroupType,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    const errorAction = validateAction(trigger.data!.action);
    if(errorAction) {
      return new ResponseData({
        message: errorAction,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    // Bangun aksi trigger
    const list_doing = await this.buildTriggerActions(trigger, payload, card_target);

    // Eksekusi aksi
    await this.executeActions(list_doing);

    return new ResponseData({
      message: "succes",
      status_code: StatusCodes.OK,
    });
  }

  // Fungsi untuk mengecek value dari trigger
  async CheckActionValue(trigger_value: ActionsValue[]): Promise<ResponseData<null>> {
    let response: ResponseData<null> = new ResponseData({}) 
    for (let index = 0; index < trigger_value.length; index++) {
      const action = trigger_value[index];
      switch(action.group_type) {
        case 'card_move': {
          const data_res = await this.checkCardMoveTrigger(action as CardMoveConfig);
          if (data_res.status_code != StatusCodes.OK) {
            response.message = data_res.message
            response.status_code = data_res.status_code
          }
          break
        }
        case 'card_changes': {
          const data_res = await this.checkCardChangesTrigger(action as CardChangesConfig);
          if (data_res.status_code != StatusCodes.OK) {
            response.message = data_res.message
            response.status_code = data_res.status_code
          }
          break
        }
      }
  
      if (response.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "action value is not found : " + response.message,
          status_code: StatusCodes.BAD_REQUEST,
        })
      } else if (response.status_code == StatusCodes.BAD_REQUEST) {
        return new ResponseData({
          message: "action value is not valid, " + response.message,
          status_code: StatusCodes.BAD_REQUEST,
        })
      } else if (response.status_code >= StatusCodes.INTERNAL_SERVER_ERROR) {
        return new ResponseData({
          message: "internal server error",
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        })
      }
    }
    
    return new ResponseData({
      message: "OK",
      status_code: StatusCodes.OK,
    })
  }

  private handleCheckConditionValueError(response: ResponseData<any>): ResponseData<null> | undefined {
    if (response.status_code == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "condition value is not found : " + response.message,
        status_code: StatusCodes.BAD_REQUEST,
      })
    } else if (response.status_code == StatusCodes.BAD_REQUEST) {
      return new ResponseData({
        message: "condition value is not valid, " + response.message,
        status_code: StatusCodes.BAD_REQUEST,
      })
    } else if (response.status_code >= StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
    return undefined
  }

  // Fungsi untuk mengecek condition dari trigger
  async CheckConditionValue(condition: any): Promise<ResponseData<null>> {
    if (condition.board_id){
      const res = await this.board_repo.getBoard({id: String(condition.board_id)});
      const resHandler = this.handleCheckConditionValueError(res);
      if (resHandler) {
        return resHandler;
      }
    }

    if (condition.board){
      const res = await this.board_repo.getBoard({id: String(condition.board)});
      const resHandler = this.handleCheckConditionValueError(res);
      if (resHandler) {
        return resHandler;
      }
    }

    if (condition.list){
      const res = await this.board_repo.getBoard({id: String(condition.list)});
      const resHandler = this.handleCheckConditionValueError(res);
      if (resHandler) {
        return resHandler;
      }
    }

    if (condition.list_id){
      const res = await this.list_repo.getList({id: String(condition.list_id)});
      const resHandler = this.handleCheckConditionValueError(res);
      if (resHandler) {
        return resHandler;
      }
    }
    
    return new ResponseData({
      message: "OK",
      status_code: StatusCodes.OK,
    })
  }

  // Fungsi untuk mengecek value dari trigger
  async PrepareDataSource(value: string | number, source_type: EnumCustomFieldSource) : Promise<ResponseData<CustomFieldCardDetail>> {
    let result =  new CustomFieldCardDetail({})
    if(value && source_type == EnumCustomFieldSource.User) {
      if (!(typeof value == "string" && isValidUUID(String(value)))) {
        return new ResponseData({
          message: "'value' is not valid uuid",
          status_code: StatusCodes.BAD_REQUEST,
        })
      }
      let checkUser =  await this.user_repo.getUser({id: value.toString()})
      if(checkUser.status_code != StatusCodes.OK){
        return new ResponseData({
          message: "'value' is not valid, " + checkUser.message,
          status_code: checkUser.status_code
        })
      }
      result.value_user_id =  value.toString()
    } else {
      return new ResponseData({
        message: "'value' is not support data",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    return new ResponseData({
      message: "success",
      status_code: StatusCodes.OK,
      data: result,
    })
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
          return `not support type for ${payload.group_type}`
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
          return `not support type for ${payload.group_type}`
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
          return `not support type for ${payload.group_type}`
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
          return `not support type for ${payload.group_type}`
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
          return `not support type for ${payload.group_type}`
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
          return `not support type for ${payload.group_type}`
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

  let must_number_condition = ["quantity", "number"];
  let mustbe_uuid_condition = [
    "by", "custom_field", "board", "board_id", "list_id", 
    "comment_id", "user_id", "label_id",
  ];
  let must_string_condition = [
    "action", "card_name", "card_desc", "card_name_or_desc", 
    "containing_or_start_with_or_ending_with", "start_with", 
    "status", "value", "operator",
  ];
  for (const key of must_number_condition) {
    if (payload.condition[key] && typeof payload.condition[key] != "number") {
      return `condition.${key} should be number`
    }
  }
  for (const key of must_string_condition) {
    if (payload.condition[key] && typeof payload.condition[key] != "string") {
      return `condition.${key} should be string`
    }
  }
  for (const key of mustbe_uuid_condition) {
    if (payload.condition[key] && !isValidUUID(payload.condition[key])) {
      return `invalid condition.${key} uuid`
    }
  }
  return undefined
}

export function validateAction(actions: Array<any>) : string | undefined {
  for (let index = 0; index < actions.length; index++) {
    let required = undefined;
    const action = actions[index];
    let keys = Object.keys(action.condition).sort();

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
          case ActionType.MoveCardToList: {
            const expected_keys: any = ["action", "position", "list_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            if (!["move", "copy"].includes(action.condition.action)) {
              return "action.condition.action not valid value"
            } else if (!["top_of_list", "bottom_of_list"].includes(action.condition.position)) {
              return "action.condition.position not valid value"
            }
            break
          }
          case ActionType.MoveCardPosition: {
            const expected_keys: any = ["action", "position", "list_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            if (!["top_of_list", "bottom_of_list", "next_list", "prev_list"].includes(action.condition.position)) {
              return "action.condition.position not valid value"
            }
            break
          }
          case ActionType.MoveToArchived: {
            const expected_keys: any = ["action"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            if (!["archive","unarchived"].includes(action.condition.action)) {
              return "action.condition.action not valid value"
            }
            break
          }
          default: {
            return "action.type not support for " + action.group_type
          }
        }
        break;
      }
      case TriggerTypes.AddRemove: {
        switch(String(action.type).toLowerCase()) {
          case ActionType.AddCardToList: {
            const expected_keys: any = ["name", "position", "list_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.MirrorTheCard: {
            const expected_keys: any = ["position", "list_id", "board_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.AddLabelToCard: {
            const expected_keys: any = ["label_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.AddLinkAttachmentToCard: {
            const expected_keys: any = ["link"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.RemoveDueDateFromCard: {
            // Tidak ada field khusus
            break;
          }
          default: {
            return "action.type not support for " + action.group_type
          }
        }
        break;
      }
      case TriggerTypes.Date: {
        switch(String(action.type).toLowerCase()) {
          case ActionType.MarkDueDateAsStatus: {
            const expected_keys: any = ["status"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.SetDueDate: {
            const expected_keys: any = ["date"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.MoveDueDate: {
            const expected_keys: any = ["date"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          default: {
            return "action.type not support for " + action.group_type
          }
        }
        break;
      }
      case TriggerTypes.Checklist: {
        switch(String(action.type).toLowerCase()) {
          case ActionType.AddChecklistToCard: {
            const expected_keys: any = ["add_or_remove", "checklist_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.AddEmptyChecklistToCard: {
            const expected_keys: any = ["checklist_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.AddItemToChecklist: {
            const expected_keys: any = ["item_name", "checklist_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.AssignCardToUser: {
            const expected_keys: any = ["user_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.SetCardDueDate: {
            const expected_keys: any = ["date"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          default: {
            return "action.type not support for " + action.group_type
          }
        }
        break;
      }
      case TriggerTypes.Member: {
        switch(String(action.type).toLowerCase()) {
          case ActionType.JoinOrLeaveCard: {
            const expected_keys: any = ["join_or_leave"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.SubscribeToCard: {
            // Tidak ada field khusus
            break;
          }
          case ActionType.AddOrRemoveUser: {
            const expected_keys: any = ["add_or_remove", "user_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.AddOrRemoveRandomUser: {
            const expected_keys: any = ["add_or_remove", "user_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.RemoveAllMembersFromCard: {
            // Tidak ada field khusus
            break;
          }
          default: {
            return "action.type not support for " + action.group_type
          }
        }
        break;
      }
      case TriggerTypes.Content:
      case TriggerTypes.CardContent: {
        switch(String(action.type).toLowerCase()) {
          case ActionType.RenameCard: {
            const expected_keys: any = ["name"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.ChangeCardDescription: {
            const expected_keys: any = ["description"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.PostComment: {
            const expected_keys: any = ["text"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.SendEmailNotificiaton: {
            const expected_keys: any = ["email", "subject", "text"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.SendGetRequestToURL: {
            const expected_keys: any = ["url"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          default: {
            return "action.type not support for " + action.group_type
          }
        }
        break;
      }
      case TriggerTypes.Field: {
        switch(String(action.type).toLowerCase()) {
          case ActionType.ClearCustomField: {
            const expected_keys: any = ["custom_field_id"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.SetCustomFieldValue: {
            const expected_keys: any = ["custom_field_id", "value"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.IncreaseCustomFieldNumberValue: {
            const expected_keys: any = ["custom_field_id", "value"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.SetDateValueCustomField: {
            const expected_keys: any = ["custom_field_id", "date"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          default: {
            return "action.type not support for " + action.group_type
          }
        }
        break;
      }
      case TriggerTypes.Sort: {
        switch(String(action.type).toLowerCase()) {
          case ActionType.SortTheListBy: {
            const expected_keys: any = ["field", "order"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.SortTheListByCustomField: {
            const expected_keys: any = ["custom_field_id", "order"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          case ActionType.SortTheListByLabel: {
            const expected_keys: any = ["label_id", "order"].sort();
            if (String(keys) !== String(expected_keys)) {
              return `we need ${expected_keys} fields for ${action.type}`
            }
            break;
          }
          default: {
            return "action.type not support for " + action.group_type
          }
        }
        break;
      }
      case TriggerTypes.CardChanges: {
        // Contoh validasi sederhana untuk CardChanges
        if (!action.condition || typeof action.condition !== "object") {
          return "action.condition should be object for CardChanges"
        }
        if (!action.condition.user_id || typeof action.condition.user_id !== "string") {
          return "action.condition.user_id is required and should be string for CardChanges"
        }
        if (!action.condition.by || typeof action.condition.by !== "string") {
          return "action.condition.by is required and should be string for CardChanges"
        }
        break;
      }
      default: {
        return "action.group_type not supported: " + action.group_type;
      }
    }

    let mustbe_uuid_condition = ["list_id", "board_id", "card_id", "user_id", "custom_field", "by"];
    let must_string_condition = ["action", "position", "name", "description", "field", "text"];
    let must_number_condition = ["quantity", "number"];
    for (const key of mustbe_uuid_condition) {
      if (action.condition[key] && !isValidUUID(action.condition[key])) {
        return `invalid action.condition.${key} uuid`
      }
    }
    for (const key of must_string_condition) {
      if (action.condition[key] && typeof action.condition[key] != "string") {
        return `action.condition.${key} should be string`
      }
    }
    for (const key of must_number_condition) {
      if (action.condition[key] && typeof action.condition[key] != "number") {
        return `action.condition.${key} should be number`
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