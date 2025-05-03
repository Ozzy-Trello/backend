import { validate as isValidUUID } from 'uuid';

import { CustomFieldCardDetail } from "@/repository/custom_field/custom_field_interfaces";
import { CardChangesConfig, CardMoveConfig, CopyCondition, MoveCondition, SourceType, ActionsValue, UserActionCondition, ConditionType } from "@/types/custom_field";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { CreateTriggerResponse, DoTriggerData, TriggerControllerI, TriggerCreateData, TriggerFilter, TriggerResponse, UpdateTriggerData } from "./trigger_interfaces";
import { StatusCodes } from "http-status-codes";
import { CardDetailUpdate, CardRepositoryI } from "@/repository/card/card_interfaces";
import { ListRepositoryI } from "@/repository/list/list_interfaces";
import { UserRepositoryI } from "@/repository/user/user_interfaces";
import { TriggerRepositoryI } from "@/repository/trigger/trigger_interfaces";
import { CardFilter } from "../card/card_interfaces";
import { Paginate } from '@/utils/data_utils';
import { filterWorkspaceDetail, WorkspaceRepositoryI } from '@/repository/workspace/workspace_interfaces';
import { BoardRepositoryI } from '@/repository/board/board_interfaces';

export class TriggerController implements TriggerControllerI {
  private workspace_repo: WorkspaceRepositoryI;
  private trigger_repo: TriggerRepositoryI
  private card_repo: CardRepositoryI
  private list_repo: ListRepositoryI
  private user_repo: UserRepositoryI
  private board_repo: BoardRepositoryI

  constructor(workspace_repo: WorkspaceRepositoryI, trigger_repo: TriggerRepositoryI, card_repo: CardRepositoryI, list_repo: ListRepositoryI, user_repo: UserRepositoryI, board_repo: BoardRepositoryI) {
    this.workspace_repo = workspace_repo;
    this.trigger_repo = trigger_repo;
    this.card_repo = card_repo;
    this.list_repo = list_repo;
    this.user_repo = user_repo;
    this.board_repo = board_repo;

    this.prepareDataSource = this.prepareDataSource.bind(this);
    this.doTrigger = this.doTrigger.bind(this);
    // this.checkConditionalValue = this.checkConditionalValue.bind(this);
  }

  async doTrigger(paylod: DoTriggerData): Promise<ResponseData<null>> {
    if(paylod.action) {
      const action: ConditionType = paylod.action!;
      switch(action){
        case ConditionType.CardInBoard: {
          const required = ["action", "by"];
          const optional = ["board"];

          this.trigger_repo.getTrigger({
            
          })

        }
        case ConditionType.CardInList: {

        }
        case ConditionType.CardAction: {

        }
        case ConditionType.ListAction: {

        }
        case ConditionType.ListHasCard: {

        }
      }
    }
    return new ResponseData({
      message: "succes",
      status_code: StatusCodes.OK,
    })
  }


  // async doTrigger(trigger_id: string, value : string| number, trigger: ActionsValue): Promise<ResponseData<null>> {
  //   let eventName = "move card";
  //   let selectedTrigger =  await this.trigger_repo.getTrigger({id: trigger_id})
  //   if(selectedTrigger.status_code != StatusCodes.OK){
  //     return new ResponseData({
  //       message: selectedTrigger.message,
  //       status_code: selectedTrigger.status_code
  //     })
  //   }

  //   // if ((selectedTrigger.data?.condition_value == String(value) || !selectedTrigger.data?.condition_value) && selectedTrigger.data?.action.target_list_id) {
  //   //   const updateResponse = await this.card_repo.updateCard(new CardFilter({
  //   //     id: trigger.target_list_id,
  //   //   }), new CardDetailUpdate({list_id: selectedTrigger.data?.action!.target_list_id}));
  //   //   if (updateResponse == StatusCodes.NOT_FOUND) {
  //   //     return new ResponseData({
  //   //       message: "Card is not found",
  //   //       status_code: StatusCodes.NOT_FOUND,
  //   //     })
  //   //   }
  //   // }

  //   return new ResponseData({
  //     message: eventName,
  //     status_code: StatusCodes.OK,
  //   })
  // }

  async checkCardMoveTrigger(data: CardMoveConfig): Promise<ResponseData<null>> {
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
        if (x_data.id_list){
          const res = await this.list_repo.getList({id: String(x_data.id_list)});
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
        if (x_data.id_list){
          const res = await this.list_repo.getList({id: String(x_data.id_list)});
          response.message = res.message;
          response.status_code = res.status_code;
          return response
        }
        break
      }
      // case 'card_position':{
      //   // no need to validation data here
      // }
      // case 'card_action':{
      //   // no need to validation data here
      // }
    }
    return new ResponseData({
      message: "success",
      status_code: StatusCodes.OK,
    })
  }

  async checkCardChangesTrigger(data: CardChangesConfig): Promise<ResponseData<null>> {
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

  async checkActionValue(trigger_value: ActionsValue[]): Promise<ResponseData<null>> {
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

  async checkConditionValue(condition: any): Promise<ResponseData<null>> {
    let response: ResponseData<null> = new ResponseData({}) 
    if (condition.board_id){
      const res = await this.board_repo.getBoard({id: String(condition.board_id)});
      response.message = res.message;
      response.status_code = res.status_code;
      return response
    }

    if (condition.board){
      const res = await this.board_repo.getBoard({id: String(condition.board)});
      response.message = res.message;
      response.status_code = res.status_code;
      return response
    }

    if (condition.list){
      const res = await this.board_repo.getBoard({id: String(condition.list)});
      response.message = res.message;
      response.status_code = res.status_code;
      return response
    }

    if (condition.id_list){
      const res = await this.list_repo.getList({id: String(condition.id_list)});
      response.message = res.message;
      response.status_code = res.status_code;
      return response
    }

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
    
    return new ResponseData({
      message: "OK",
      status_code: StatusCodes.OK,
    })
  }

  // async checkActionValue(trigger_value: ActionsValue): Promise<ResponseData<null>> {
  //   if(trigger_value.target_list_id) {
  //     let checkList = await this.list_repo.getList({id: String(trigger_value.target_list_id)});      
  //     if (checkList.status_code == StatusCodes.NOT_FOUND) {
  //       return new ResponseData({
  //         message: "trigger value is not valid, list is not found",
  //         status_code: StatusCodes.BAD_REQUEST,
  //       })      
  //     } else if (checkList.status_code == StatusCodes.BAD_REQUEST) {
  //       return new ResponseData({
  //         message: "condition value is not valid, " + checkList.message,
  //         status_code: StatusCodes.BAD_REQUEST,
  //       })      
  //     } else if (checkList.status_code >= StatusCodes.INTERNAL_SERVER_ERROR) {
  //       return new ResponseData({
  //         message: "internal server error",
  //         status_code: StatusCodes.INTERNAL_SERVER_ERROR,
  //       })      
  //     }
  //   }
  //   if(trigger_value.label_card_id) {
  //     let checkCard = await this.card_repo.getCard({id: String(trigger_value.label_card_id)});
  //     if (checkCard.status_code == StatusCodes.NOT_FOUND) {
  //       return new ResponseData({
  //         message: "trigger value is not valid, card is not found",
  //         status_code: StatusCodes.BAD_REQUEST,
  //       })      
  //     } else if (checkCard.status_code == StatusCodes.BAD_REQUEST) {
  //       return new ResponseData({
  //         message: "condition value is not valid, " + checkCard.message,
  //         status_code: StatusCodes.BAD_REQUEST,
  //       })      
  //     } else if (checkCard.status_code >= StatusCodes.INTERNAL_SERVER_ERROR) {
  //       return new ResponseData({
  //         message: "internal server error",
  //         status_code: StatusCodes.INTERNAL_SERVER_ERROR,
  //       })
  //     }
  //   }
  //   return new ResponseData({
  //     message: "OK",
  //     status_code: StatusCodes.OK,
  //   })
  // }

  


  // async checkConditionalValue(condition_value : string| number, source_type: SourceType, trigger_value :ActionsValue[]): Promise<ResponseData<null>> {
  //   if(condition_value) {
  //     switch(source_type) {
  //       case SourceType.User : {
  //         let checkUser = await this.user_repo.getUser({id: String(condition_value)});
  //         if (checkUser.status_code == StatusCodes.NOT_FOUND) {
  //           return new ResponseData({
  //             message: "condition value is not valid, user is not found",
  //             status_code: StatusCodes.BAD_REQUEST,
  //           })      
  //         } else if (checkUser.status_code == StatusCodes.BAD_REQUEST) {
  //           return new ResponseData({
  //             message: "condition value is not valid, " + checkUser.message,
  //             status_code: StatusCodes.BAD_REQUEST,
  //           })      
  //         } else if (checkUser.status_code >= StatusCodes.INTERNAL_SERVER_ERROR) {
  //           return new ResponseData({
  //             message: "internal server error",
  //             status_code: StatusCodes.INTERNAL_SERVER_ERROR,
  //           })      
  //         }
  //       }
  //     }
  //   }

  //   let checkActionValue = await this.checkActionValue(trigger_value);
  //   if (checkActionValue.status_code != StatusCodes.OK) {
  //     return new ResponseData({
  //       message: checkActionValue.message,
  //       status_code: checkActionValue.status_code,
  //     })
  //   }
  //   return new ResponseData({
  //     message: "success",
  //     status_code: StatusCodes.OK,
  //   })
  // }

  async prepareDataSource(value: string | number, source_type: SourceType) : Promise<ResponseData<CustomFieldCardDetail>> {
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

  async CreateTrigger(data: TriggerCreateData): Promise<ResponseData<CreateTriggerResponse>> {  
    let workspaceFilter = new filterWorkspaceDetail({id: data.workspace_id})
    if (!isValidUUID(workspaceFilter.id!)) {
      return new ResponseData({
        message: "not valid workspace id",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let workspace = await this.workspace_repo.getWorkspace(workspaceFilter)
    if (workspace.status_code != StatusCodes.OK) {
      let msg = "internal server error"
      if (workspace.status_code == StatusCodes.NOT_FOUND){
        msg = "workspace is not found"
      }
      return new ResponseData({
        message: msg,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    data.workspace_id = workspace.data?.id!

    let checkData = await this.checkActionValue(data.action);
    if (checkData.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkData.message,
        status_code: checkData.status_code,
      })
    }

    checkData = await this.checkConditionValue(data.condition);
    if (checkData.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkData.message,
        status_code: checkData.status_code,
      })
    }

    // let checkSourceVal = await this.checkConditionalValue(trigger.conditional_value, checkCustomField.data?.source!, trigger.action)
    // if (checkSourceVal.status_code != StatusCodes.OK){
    //   return new ResponseData({
    //     message: checkSourceVal.message,
    //     status_code: checkSourceVal.status_code,
    //   })
    // }

    let createResponse = await this.trigger_repo.createTrigger(data);
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      console.log(createResponse.message)
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    return new ResponseData({
      message: "Trigger created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateTriggerResponse({
        id: createResponse.data?.id,
      }),
    })
  }

  async GetTrigger(filter: TriggerFilter): Promise<ResponseData<TriggerResponse>> {
    if (filter.workspace_id && filter.workspace_user_id_owner){
      return new ResponseData({
        message: "you cant use filter `worksace-id` while using `my-default` filter",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    if (filter.workspace_id){
      let workspaceFilter = new filterWorkspaceDetail({id: filter.workspace_id})
      if (!isValidUUID(workspaceFilter.id!)) {
        delete workspaceFilter.id;
        workspaceFilter.slug = filter.workspace_id;
        delete filter.workspace_id;
      }
      if (filter.workspace_user_id_owner && isValidUUID(filter.workspace_user_id_owner!)) {
        workspaceFilter.user_id_owner = filter.workspace_user_id_owner;
        delete filter.workspace_user_id_owner;
      }

      let workspace = await this.workspace_repo.getWorkspace(workspaceFilter)
      if (workspace.status_code != StatusCodes.OK) {
        let msg = "internal server error"
        if (workspace.status_code == StatusCodes.NOT_FOUND){
          msg = "workspace is not found"
        }
        return new ResponseData({
          message: msg,
          status_code: StatusCodes.BAD_REQUEST,
        })
      }
      filter.workspace_id = workspace.data?.id!
    }

    let checkTrigger = await this.trigger_repo.getTrigger(filter.toFilterTriggerDetail());
    if (checkTrigger.status_code == StatusCodes.NOT_FOUND){
      return new ResponseData({
        message: checkTrigger.message,
        status_code: checkTrigger.status_code,
      })  
    }
    return new ResponseData({
      message: checkTrigger.message,
      status_code: checkTrigger.status_code,
      data: checkTrigger.data!,
    })
  }

  async GetListTrigger(filter: TriggerFilter, paginate: Paginate): Promise<ResponseListData<Array<TriggerResponse>>> {
    if (filter.workspace_id && filter.workspace_user_id_owner){
      return new ResponseListData({
        message: "you cant use filter `worksace-id` while using `my-default` filter",
        status_code: StatusCodes.BAD_REQUEST,
        data: [],
      }, paginate)
    }
    if (filter.workspace_id || filter.workspace_user_id_owner){
      let workspaceFilter = new filterWorkspaceDetail({id: filter.workspace_id, user_id_owner: filter.workspace_user_id_owner})
      if (workspaceFilter.id && !isValidUUID(workspaceFilter.id!)) {
        delete workspaceFilter.id;
        workspaceFilter.slug = filter.workspace_id;
        delete filter.workspace_id;
      }
      if (filter.workspace_user_id_owner && isValidUUID(filter.workspace_user_id_owner!)) {
        workspaceFilter.user_id_owner = filter.workspace_user_id_owner;
        delete filter.workspace_user_id_owner;
      }

      let workspace = await this.workspace_repo.getWorkspace(workspaceFilter)
      if (workspace.status_code != StatusCodes.OK) {
        let msg = "internal server error"
        if (workspace.status_code == StatusCodes.NOT_FOUND){
          msg = "workspace is not found"
        }
        return new ResponseListData({
          message: msg,
          status_code: StatusCodes.BAD_REQUEST,
          data: [],
        }, paginate)
      }
      filter.workspace_id = workspace.data?.id!
    }

    let triggerList = await this.trigger_repo.getListTrigger(filter.toFilterTriggerDetail(), paginate);
    if (triggerList.status_code != StatusCodes.OK){
      return new ResponseListData({
        message: triggerList.message,
        status_code: triggerList.status_code,
        data: [],
      }, paginate)
    }
    return new ResponseListData({
      message: "trigger list",
      status_code: StatusCodes.OK,
      data: triggerList.data!,
    }, triggerList.paginate)
  }

  async DeleteTrigger(filter: TriggerFilter): Promise<ResponseData<null>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to delete",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    if (filter.workspace_id && filter.workspace_user_id_owner){
      return new ResponseData({
        message: "you cant use filter `worksace-id` while using `my-default` filter",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    if (filter.workspace_id){
      let workspaceFilter = new filterWorkspaceDetail({id: filter.workspace_id})
      if (!isValidUUID(workspaceFilter.id!)) {
        delete workspaceFilter.id;
        workspaceFilter.slug = filter.workspace_id;
        delete filter.workspace_id;
      }
      if (filter.workspace_user_id_owner && isValidUUID(filter.workspace_user_id_owner!)) {
        workspaceFilter.user_id_owner = filter.workspace_user_id_owner;
        delete filter.workspace_user_id_owner;
      }

      let workspace = await this.workspace_repo.getWorkspace(workspaceFilter)
      if (workspace.status_code != StatusCodes.OK) {
        let msg = "internal server error"
        if (workspace.status_code == StatusCodes.NOT_FOUND){
          msg = "workspace is not found"
        }
        return new ResponseData({
          message: msg,
          status_code: StatusCodes.BAD_REQUEST,
        })
      }
      filter.workspace_id = workspace.data?.id!
    }
    const deleteResponse = await this.trigger_repo.deleteTrigger(filter);
    if (deleteResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Trigger is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "Trigger is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }

  async UpdateTrigger(filter: TriggerFilter, data: UpdateTriggerData): Promise<ResponseData<null>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to update",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    if (data.isEmpty()) {
      return new ResponseData({
        message: "you need data to update",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    if (filter.workspace_id && filter.workspace_user_id_owner){
      return new ResponseData({
        message: "you cant use filter `worksace-id` while using `my-default` filter",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    if (filter.workspace_id){
      let workspaceFilter = new filterWorkspaceDetail({id: filter.workspace_id})
      if (!isValidUUID(workspaceFilter.id!)) {
        delete workspaceFilter.id;
        workspaceFilter.slug = filter.workspace_id;
        delete filter.workspace_id;
      }
      if (filter.workspace_user_id_owner && isValidUUID(filter.workspace_user_id_owner!)) {
        workspaceFilter.user_id_owner = filter.workspace_user_id_owner;
        delete filter.workspace_user_id_owner;
      }

      let workspace = await this.workspace_repo.getWorkspace(workspaceFilter)
      if (workspace.status_code != StatusCodes.OK) {
        let msg = "internal server error"
        if (workspace.status_code == StatusCodes.NOT_FOUND){
          msg = "workspace is not found"
        }
        return new ResponseData({
          message: msg,
          status_code: StatusCodes.BAD_REQUEST,
        })
      }
      filter.workspace_id = workspace.data?.id!
    }

    if (filter.id) {
      let currentBoard = await this.trigger_repo.getTrigger({ id: filter.id });
      if (currentBoard.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "Board is not found",
          status_code: StatusCodes.NOT_FOUND,
        })
      }

      let checkBoard = await this.trigger_repo.getTrigger({ __notId: filter.id, __orName: data.name });
      if (checkBoard.status_code == StatusCodes.OK) {
        return new ResponseData({
          message: "this trigger name already taken by others",
          status_code: StatusCodes.NOT_FOUND,
        })
      }
    }

    const updateResponse = await this.trigger_repo.updateTrigger(filter.toFilterTriggerDetail(), data.toTriggerDetailUpdate());
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Trigger is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "Trigger is updated successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }
}