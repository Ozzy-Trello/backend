import { validate as isValidUUID } from 'uuid';

import { CustomFieldCardDetail } from "@/repository/custom_field/custom_field_interfaces";
import { SourceType, TriggerValue } from "@/types/custom_field";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { CreateTriggerResponse, fromTriggerDetailToTriggerResponse, fromTriggerDetailToTriggerResponseList, TriggerControllerI, TriggerCreateData, TriggerFilter, TriggerResponse, UpdateTriggerData } from "./trigger_interfaces";
import { StatusCodes } from "http-status-codes";
import { CardDetailUpdate, CardRepositoryI } from "@/repository/card/card_interfaces";
import { ListRepositoryI } from "@/repository/list/list_interfaces";
import { UserRepositoryI } from "@/repository/user/user_interfaces";
import { TriggerRepositoryI } from "@/repository/trigger/trigger_interfaces";
import { CardFilter } from "../card/card_interfaces";
import { Paginate } from '@/utils/data_utils';
import { filterWorkspaceDetail, WorkspaceRepositoryI } from '@/repository/workspace/workspace_interfaces';

export class TriggerController implements TriggerControllerI {
  private workspace_repo: WorkspaceRepositoryI;
  private trigger_repo: TriggerRepositoryI
  private card_repo: CardRepositoryI
  private list_repo: ListRepositoryI
  private user_repo: UserRepositoryI

  constructor(workspace_repo: WorkspaceRepositoryI, trigger_repo: TriggerRepositoryI, card_repo: CardRepositoryI, list_repo: ListRepositoryI, user_repo: UserRepositoryI) {
    this.workspace_repo = workspace_repo;
    this.trigger_repo = trigger_repo;
    this.card_repo = card_repo;
    this.list_repo = list_repo;
    this.user_repo = user_repo;

    this.prepareDataSource = this.prepareDataSource.bind(this);
    this.doTrigger = this.doTrigger.bind(this);
    this.checkConditionalValue = this.checkConditionalValue.bind(this);
  }

  async doTrigger(trigger_id: string, value : string| number, trigger: TriggerValue): Promise<ResponseData<null>> {
    let eventName = "move card";
    let selectedTrigger =  await this.trigger_repo.getTrigger({id: trigger_id})
    if(selectedTrigger.status_code != StatusCodes.OK){
      return new ResponseData({
        message: selectedTrigger.message,
        status_code: selectedTrigger.status_code
      })
    }

    if ((selectedTrigger.data?.condition_value == String(value) || !selectedTrigger.data?.condition_value) && selectedTrigger.data?.action.target_list_id) {
      const updateResponse = await this.card_repo.updateCard(new CardFilter({
        id: trigger.target_list_id,
      }), new CardDetailUpdate({list_id: selectedTrigger.data?.action!.target_list_id}));
      if (updateResponse == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "Card is not found",
          status_code: StatusCodes.NOT_FOUND,
        })
      }
    }

    return new ResponseData({
      message: eventName,
      status_code: StatusCodes.OK,
    })
  }

  async checkTriggerValue(trigger_value: TriggerValue): Promise<ResponseData<null>> {
    if(trigger_value.target_list_id) {
      let checkList = await this.list_repo.getList({id: String(trigger_value.target_list_id)});      
      if (checkList.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "trigger value is not valid, list is not found",
          status_code: StatusCodes.BAD_REQUEST,
        })      
      } else if (checkList.status_code == StatusCodes.BAD_REQUEST) {
        return new ResponseData({
          message: "condition value is not valid, " + checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        })      
      } else if (checkList.status_code >= StatusCodes.INTERNAL_SERVER_ERROR) {
        return new ResponseData({
          message: "internal server error",
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        })      
      }
    }
    if(trigger_value.label_card_id) {
      let checkCard = await this.card_repo.getCard({id: String(trigger_value.label_card_id)});
      if (checkCard.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "trigger value is not valid, card is not found",
          status_code: StatusCodes.BAD_REQUEST,
        })      
      } else if (checkCard.status_code == StatusCodes.BAD_REQUEST) {
        return new ResponseData({
          message: "condition value is not valid, " + checkCard.message,
          status_code: StatusCodes.BAD_REQUEST,
        })      
      } else if (checkCard.status_code >= StatusCodes.INTERNAL_SERVER_ERROR) {
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

  async checkConditionalValue(value : string| number, source_type: SourceType, trigger_value :TriggerValue): Promise<ResponseData<null>> {
    if(value) {
      switch(source_type) {
        case SourceType.User : {
          let checkUser = await this.user_repo.getUser({id: String(value)});
          if (checkUser.status_code == StatusCodes.NOT_FOUND) {
            return new ResponseData({
              message: "condition value is not valid, user is not found",
              status_code: StatusCodes.BAD_REQUEST,
            })      
          } else if (checkUser.status_code == StatusCodes.BAD_REQUEST) {
            return new ResponseData({
              message: "condition value is not valid, " + checkUser.message,
              status_code: StatusCodes.BAD_REQUEST,
            })      
          } else if (checkUser.status_code >= StatusCodes.INTERNAL_SERVER_ERROR) {
            return new ResponseData({
              message: "internal server error",
              status_code: StatusCodes.INTERNAL_SERVER_ERROR,
            })      
          }
        }
      }
    }

    let checkTriggerValue = await this.checkTriggerValue(trigger_value);
    if (checkTriggerValue.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkTriggerValue.message,
        status_code: checkTriggerValue.status_code,
      })
    }
    return new ResponseData({
      message: "success",
      status_code: StatusCodes.OK,
    })
  }

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
    let payloadCheck = data.checkRequired();
    if (payloadCheck) {
      return new ResponseData({
        message: `you need to put '${payloadCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let errorField = data.getErrorField();
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let emptyAction = data.isEmptyAction();
    if (emptyAction){
      return new ResponseData({
        message: "we need `target_list_id` or `message_telegram` or `label_card_id`",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    
    let workspaceFilter = new filterWorkspaceDetail({id: data.workspace_id})
    if (!isValidUUID(workspaceFilter.id!)) {
      // delete workspaceFilter.id;
      // workspaceFilter.slug = data.workspace_id;

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

    let checkData = await this.checkTriggerValue(data.action);
    if (checkData.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkData.message,
        status_code: checkData.status_code,
      })
    }

    let checkTrigger = await this.trigger_repo.getTrigger({ workspace_id: workspace.data?.id!, name: data.name });
    if (checkTrigger.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "trigger name already exist in your workspace",
        status_code: StatusCodes.CONFLICT,
      })
    }

    let createResponse = await this.trigger_repo.createTrigger(data.toTriggerDetail());
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
      data: fromTriggerDetailToTriggerResponse(checkTrigger.data!),
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

    let boards = await this.trigger_repo.getListTrigger(filter.toFilterTriggerDetail(), paginate);
    return new ResponseListData({
      message: "trigger list",
      status_code: StatusCodes.OK,
      data: fromTriggerDetailToTriggerResponseList(boards.data!),
    }, boards.paginate)
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