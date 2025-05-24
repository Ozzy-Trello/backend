import { validate as isValidUUID } from 'uuid';

import { CustomFieldCardDetail } from "@/repository/custom_field/custom_field_interfaces";
import { SourceType } from "@/types/custom_field";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { CreateTriggerResponse, TriggerControllerI, TriggerCreateData, TriggerFilter, TriggerResponse, UpdateTriggerData } from "./trigger_interfaces";
import { StatusCodes } from "http-status-codes";
import { CardRepositoryI } from "@/repository/card/card_interfaces";
import { ListRepositoryI } from "@/repository/list/list_interfaces";
import { UserRepositoryI } from "@/repository/user/user_interfaces";
import { TriggerRepositoryI } from "@/repository/trigger/trigger_interfaces";
import { TriggerDoData } from "../card/card_interfaces";
import { Paginate } from '@/utils/data_utils';
import { filterWorkspaceDetail, WorkspaceRepositoryI } from '@/repository/workspace/workspace_interfaces';
import { BoardRepositoryI } from '@/repository/board/board_interfaces';
import { Trigger } from './trigger';

export class TriggerController implements TriggerControllerI {
  private workspace_repo: WorkspaceRepositoryI;
  private trigger_repo: TriggerRepositoryI
  private trigger: Trigger;

  constructor(workspace_repo: WorkspaceRepositoryI, trigger_repo: TriggerRepositoryI, card_repo: CardRepositoryI, list_repo: ListRepositoryI, user_repo: UserRepositoryI, board_repo: BoardRepositoryI) {
    this.workspace_repo = workspace_repo;
    this.trigger_repo = trigger_repo;
    this.trigger = new Trigger(workspace_repo, trigger_repo, card_repo, list_repo, user_repo, board_repo);

    this.prepareDataSource = this.prepareDataSource.bind(this);
    this.doTrigger = this.doTrigger.bind(this);
  }

  async prepareDataSource(value: string | number, source_type: SourceType): Promise<ResponseData<CustomFieldCardDetail>> {
    return this.trigger.prepareDataSource(value, source_type);
  }
  async doTrigger(paylod: TriggerDoData): Promise<ResponseData<null>> {
    return this.trigger.doTrigger(paylod);
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

    let checkData = await this.trigger.checkActionValue(data.action);
    if (checkData.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkData.message,
        status_code: checkData.status_code,
      })
    }

    checkData = await this.trigger.checkConditionValue(data.condition);
    if (checkData.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkData.message,
        status_code: checkData.status_code,
      })
    }

    const triggerData = await this.trigger_repo.getTrigger(data)
    if (triggerData.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      console.log(triggerData.message)
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
    if (triggerData.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "this trigger is already exist",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

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