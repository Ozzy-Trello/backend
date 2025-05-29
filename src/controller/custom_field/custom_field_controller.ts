import { validate as isValidUUID } from 'uuid';

import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import { CardCustomFieldResponse, CustomFieldRepositoryI } from '@/repository/custom_field/custom_field_interfaces';
import { CreateCustomFieldResponse, fromCustomFieldDetailToCustomFieldResponse, fromCustomFieldDetailToCustomFieldResponseCustomField, CustomFieldControllerI, CustomFieldCreateData, CustomFieldFilter, CustomFieldResponse, UpdateCustomFieldData } from '@/controller/custom_field/custom_field_interfaces';
import { filterWorkspaceDetail, WorkspaceRepositoryI } from '@/repository/workspace/workspace_interfaces';
import { TriggerControllerI, TriggerFilter } from '../trigger/trigger_interfaces';
import { TriggerRepositoryI } from '@/repository/trigger/trigger_interfaces';
import { EnumCustomFieldSource } from '@/types/custom_field';

export class CustomFieldController implements CustomFieldControllerI {
  private custom_field_repo: CustomFieldRepositoryI
  private workspace_repo: WorkspaceRepositoryI
  private trigger_repo: TriggerRepositoryI;
  private trigger_controller: TriggerControllerI;

  constructor(custom_field_repo: CustomFieldRepositoryI, workspace_repo: WorkspaceRepositoryI, trigger_repo: TriggerRepositoryI, trigger_controller: TriggerControllerI) {
    this.custom_field_repo = custom_field_repo;
    this.workspace_repo = workspace_repo;
    this.trigger_repo = trigger_repo;
    this.trigger_controller = trigger_controller;

    this.GetCustomField = this.GetCustomField.bind(this);
    this.GetListCustomField = this.GetListCustomField.bind(this);
    this.DeleteCustomField = this.DeleteCustomField.bind(this);
    this.UpdateCustomField = this.UpdateCustomField.bind(this);
    this.CreateCustomField = this.CreateCustomField.bind(this);
  }

  async CreateCustomField(user_id: string, data: CustomFieldCreateData): Promise<ResponseData<CreateCustomFieldResponse>> {
    let paylodCheck = data.checkRequired();
    if (paylodCheck) {
      return new ResponseData({
        message: `you need to put '${paylodCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    console.log("In controller: CreateCustomField: %o", data);

    let errorField = data.getErrorField();
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    
    let workspace = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail(({id: data.workspace_id})));
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

    let checkCustomField = await this.custom_field_repo.getCustomField({ workspace_id: data.workspace_id, name: data.name });
    if (checkCustomField.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "custom_field name already exist in your workspace",
        status_code: StatusCodes.CONFLICT,
      })
    }

    // if (data.trigger_id) {
      // const checkTrigger = await this.trigger_repo.getTrigger(new TriggerFilter({id: data.trigger_id}))
      // if (checkTrigger.status_code != StatusCodes.OK) {
      //   return new ResponseData({
      //     message: checkTrigger.message,
      //     status_code: checkTrigger.status_code
      //   })
      // }

      // let checkSourceVal = await this.trigger_controller.checkConditionalValue(checkTrigger.data?.condition_value!, checkCustomField.data?.source!, checkTrigger.data?.action!)
      // if (checkSourceVal.status_code != StatusCodes.OK){
      //   return new ResponseData({
      //     message: checkSourceVal.message,
      //     status_code: checkSourceVal.status_code,
      //   })
      // }
    // }

    let createResponse = await this.custom_field_repo.createCustomField(data.toCustomFieldDetail());
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    return new ResponseData({
      message: "CustomField created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateCustomFieldResponse({
        id: createResponse.data?.id,
      }),
    })
  }

  async GetCustomField(filter: CustomFieldFilter): Promise<ResponseData<CustomFieldResponse>> {
    if (filter.isEmpty()){
      return new ResponseData({
        message: "you need to put filter to get workspace data",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    let errorFiled =  filter.getErrorfield();
    if (errorFiled){
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    if(filter.workspace_id){
      let checkList = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail(({id: filter.workspace_id})));
      if (checkList.status_code == StatusCodes.NOT_FOUND){
        return new ResponseData({
          message: checkList.message,
          status_code: checkList.status_code,
        })  
      }
    }

    let checkList = await this.custom_field_repo.getCustomField(filter.toFilterCustomFieldDetail());
      if (checkList.status_code != StatusCodes.OK){
        return new ResponseData({
          message: checkList.message,
          status_code: checkList.status_code,
        })  
      }

    return new ResponseData({
      message: checkList.message,
      status_code: checkList.status_code,
      data: fromCustomFieldDetailToCustomFieldResponse(checkList.data!),
    })
  }

  async GetListCustomField(filter: CustomFieldFilter, paginate: Paginate): Promise<ResponseListData<Array<CustomFieldResponse>>> {
    let errorFiled =  filter.getErrorfield();
    if (errorFiled){
      return new ResponseListData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST
      }, paginate)
    }

    if(filter.workspace_id){
      let checkList = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail(({id: filter.workspace_id})));
      if (checkList.status_code != StatusCodes.OK){
        return new ResponseListData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST
        }, paginate)
      }
    }

    let custom_fields = await this.custom_field_repo.getListCustomField(filter.toFilterCustomFieldDetail(), paginate);
    return new ResponseListData({
      message: "CustomField workspace",
      status_code: StatusCodes.OK,
      data: custom_fields.data!,
    }, custom_fields.paginate)
  }

  async DeleteCustomField(filter: CustomFieldFilter): Promise<ResponseData<null>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to delete",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    let errorFiled = filter.getErrorfield();
    if (errorFiled){
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    if(filter.workspace_id){
      let checkList = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail(({id: filter.workspace_id})));
      if (checkList.status_code != StatusCodes.OK){
        return new ResponseData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        })
      }
    }
    const deleteResponse = await this.custom_field_repo.deleteCustomField(filter);
    if (deleteResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "CustomField is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "CustomField is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }

  async UpdateCustomField(filter: CustomFieldFilter, data: UpdateCustomFieldData): Promise<ResponseData<null>> {
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
    let errorFiled = filter.getErrorfield();
    if (errorFiled){
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    errorFiled = data.getErrorfield();
    if (errorFiled){
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    if(filter.workspace_id){
      let checkList = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail({id: filter.workspace_id}));
      if (checkList.status_code != StatusCodes.OK){
        return new ResponseData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        })
      }
    }

    if (filter.id) {
      let currentCustomField = await this.custom_field_repo.getCustomField({ id: filter.id });
      if (currentCustomField.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "CustomField is not found",
          status_code: StatusCodes.NOT_FOUND,
        })
      }

      // let checkCustomFieldName = await this.custom_field_repo.getCustomField({ __notId: filter.id, __orName: data.name, __orWorkspaceId: filter.workspace_id});
      // if (checkCustomFieldName.status_code == StatusCodes.OK) {
      //   return new ResponseData({
      //     message: "this workspace name already taken by others",
      //     status_code: StatusCodes.NOT_FOUND,
      //   })
      // }

      if (data.trigger_id) {
        const checkTrigger = await this.trigger_repo.getTrigger(new TriggerFilter({id: data.trigger_id}))
        if (checkTrigger.status_code != StatusCodes.OK) {
          return new ResponseData({
            message: checkTrigger.message,
            status_code: checkTrigger.status_code
          })
        }
  
        // let checkSourceVal = await this.trigger_controller.checkConditionalValue(checkTrigger.data?.condition_value!, currentCustomField.data?.source!, checkTrigger.data?.action!)
        // if (checkSourceVal.status_code != StatusCodes.OK){
        //   return new ResponseData({
        //     message: checkSourceVal.message,
        //     status_code: checkSourceVal.status_code,
        //   })
        // }
      }
    } else {
      return new ResponseData({
        message: "Update without id currenly is not supported",
        status_code: StatusCodes.BAD_REQUEST
      })
    }

    const updateResponse = await this.custom_field_repo.updateCustomField(filter.toFilterCustomFieldDetail(), data.toCustomFieldDetailUpdate());
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "CustomField is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "CustomField is updated successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }

  async GetListCardCustomField(workspace_id: string, card_id: string): Promise<ResponseData<Array<CardCustomFieldResponse>>> {
    const cardListCardCustomField = await this.custom_field_repo.getListCardCustomField(workspace_id, card_id);
    return cardListCardCustomField
  }
}