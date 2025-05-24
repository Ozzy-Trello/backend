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
import { ActionsValue, CardChangesConfig, CardMoveConfig, ConditionType, CopyCondition, MoveCondition, SourceType, UserActionCondition } from "@/types/custom_field";
import { CustomFieldCardDetail } from "@/repository/custom_field/custom_field_interfaces";
import { validateAction, validateDataByGroupType } from './trigger_interfaces';

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

    const errorAction = validateAction(trigger.data!.action);
    if(errorAction) {
      return new ResponseData({
        message: errorAction,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    const errorsDataByGroupType = validateDataByGroupType(trigger.data!);
    if(errorsDataByGroupType) {
      return new ResponseData({
        message: errorsDataByGroupType,
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
  async PrepareDataSource(value: string | number, source_type: SourceType) : Promise<ResponseData<CustomFieldCardDetail>> {
    let result =  new CustomFieldCardDetail({})
    if(value && source_type == SourceType.User) {
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