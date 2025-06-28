import { validate as isValidUUID, v4 as uuidv4 } from "uuid";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import { broadcastToWebSocket } from "@/server";
import {
  EnumTriggeredBy,
  EnumUserActionEvent,
  UserActionEvent,
} from "@/types/event";
import { EventPublisher } from "@/event_publisher";
import {
  CardCustomFieldResponse,
  CardCustomFieldValueUpdate,
  CustomFieldDetail,
  CustomFieldRepositoryI,
} from "@/repository/custom_field/custom_field_interfaces";
import {
  CreateCustomFieldResponse,
  fromCustomFieldDetailToCustomFieldResponse,
  fromCustomFieldDetailToCustomFieldResponseCustomField,
  CustomFieldControllerI,
  CustomFieldCreateData,
  CustomFieldFilter,
  CustomFieldResponse,
  UpdateCustomFieldData,
} from "@/controller/custom_field/custom_field_interfaces";
import {
  filterWorkspaceDetail,
  WorkspaceRepositoryI,
} from "@/repository/workspace/workspace_interfaces";
import {
  TriggerControllerI,
  TriggerFilter,
} from "../trigger/trigger_interfaces";
import { TriggerRepositoryI } from "@/repository/trigger/trigger_interfaces";
import { EnumCustomFieldSource } from "@/types/custom_field";
import { InternalServerError } from "@/utils/errors";

export class CustomFieldController implements CustomFieldControllerI {
  private custom_field_repo: CustomFieldRepositoryI;
  private workspace_repo: WorkspaceRepositoryI;
  private trigger_repo: TriggerRepositoryI;
  private trigger_controller: TriggerControllerI;
  private event_publisher: EventPublisher | undefined;

  SetEventPublisher(event_publisher: EventPublisher): void {
    this.event_publisher = event_publisher;
  }

  constructor(
    custom_field_repo: CustomFieldRepositoryI,
    workspace_repo: WorkspaceRepositoryI,
    trigger_repo: TriggerRepositoryI,
    trigger_controller: TriggerControllerI
  ) {
    this.custom_field_repo = custom_field_repo;
    this.workspace_repo = workspace_repo;
    this.trigger_repo = trigger_repo;
    this.trigger_controller = trigger_controller;

    this.GetCustomField = this.GetCustomField.bind(this);
    this.GetListCustomField = this.GetListCustomField.bind(this);
    this.DeleteCustomField = this.DeleteCustomField.bind(this);
    this.UpdateCustomField = this.UpdateCustomField.bind(this);
    this.CreateCustomField = this.CreateCustomField.bind(this);
    this.SetEventPublisher = this.SetEventPublisher.bind(this);
  }

  async ReorderCustomFields(
    user_id: string,
    workspaceId: string,
    customFieldId: string,
    targetPosition: number,
    targetPositionTopOrBottom?: "top" | "bottom"
  ): Promise<ResponseData<null>> {
    try {
      // Validate workspace access
      const workspace = await this.workspace_repo.getWorkspace(
        new filterWorkspaceDetail({ id: workspaceId })
      );

      if (workspace.status_code !== StatusCodes.OK) {
        return new ResponseData({
          status_code: StatusCodes.NOT_FOUND,
          message: "Workspace not found",
        });
      }

      // Check if user has permission to manage custom fields in this workspace
      // Add your permission check logic here if needed

      // Perform the reorder operation
      const result = await this.custom_field_repo.reorderCustomFields(
        workspaceId,
        customFieldId,
        targetPosition,
        targetPositionTopOrBottom
      );

      // Publish event if needed
      if (this.event_publisher) {
        const event: UserActionEvent = {
          eventId: uuidv4(),
          type: EnumUserActionEvent.CardUpdated, // Using CardUpdated as a fallback since we don't have a specific event for custom field reorder
          workspace_id: workspaceId,
          user_id: user_id,
          timestamp: new Date(),
          data: {
            card: {
              id: customFieldId,
              action: "custom_field_reordered",
              custom_field_id: customFieldId,
              target_position: targetPosition,
              position_type: targetPositionTopOrBottom || "position",
            },
          },
        };
        await this.event_publisher.publishUserAction(event);
      }

      return result;
    } catch (error) {
      console.error("Error reordering custom fields:", error);
      return new ResponseData({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to reorder custom fields",
      });
    }
  }

  async CreateCustomField(
    user_id: string,
    data: CustomFieldCreateData
  ): Promise<ResponseData<CreateCustomFieldResponse>> {
    let paylodCheck = data.checkRequired();
    if (paylodCheck) {
      return new ResponseData({
        message: `you need to put '${paylodCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    console.log("In controller: CreateCustomField: %o", data);

    let errorField = data.getErrorField();
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let workspace = await this.workspace_repo.getWorkspace(
      new filterWorkspaceDetail({ id: data.workspace_id })
    );
    if (workspace.status_code != StatusCodes.OK) {
      let msg = "internal server error";
      if (workspace.status_code == StatusCodes.NOT_FOUND) {
        msg = "workspace is not found";
      }
      return new ResponseData({
        message: msg,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let checkCustomField = await this.custom_field_repo.getCustomField({
      workspace_id: data.workspace_id,
      name: data.name,
    });
    if (checkCustomField.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "custom_field name already exist in your workspace",
        status_code: StatusCodes.CONFLICT,
      });
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

    let createResponse = await this.custom_field_repo.createCustomField(
      data.toCustomFieldDetail()
    );
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    return new ResponseData({
      message: "CustomField created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateCustomFieldResponse({
        id: createResponse.data?.id,
      }),
    });
  }

  async GetCustomField(
    filter: CustomFieldFilter
  ): Promise<ResponseData<CustomFieldResponse>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need to put filter to get workspace data",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    let errorFiled = filter.getErrorfield();
    if (errorFiled) {
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    if (filter.workspace_id) {
      let checkList = await this.workspace_repo.getWorkspace(
        new filterWorkspaceDetail({ id: filter.workspace_id })
      );
      if (checkList.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: checkList.message,
          status_code: checkList.status_code,
        });
      }
    }

    let checkList = await this.custom_field_repo.getCustomField(
      filter.toFilterCustomFieldDetail()
    );
    if (checkList.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkList.message,
        status_code: checkList.status_code,
      });
    }

    return new ResponseData({
      message: checkList.message,
      status_code: checkList.status_code,
      data: fromCustomFieldDetailToCustomFieldResponse(checkList.data!),
    });
  }

  async GetListCustomField(
    filter: CustomFieldFilter,
    paginate: Paginate,
    user_id?: string
  ): Promise<ResponseListData<Array<CustomFieldResponse>>> {
    let errorFiled = filter.getErrorfield();
    if (errorFiled) {
      return new ResponseListData(
        {
          message: errorFiled,
          status_code: StatusCodes.BAD_REQUEST,
        },
        paginate
      );
    }

    if (filter.workspace_id) {
      let checkList = await this.workspace_repo.getWorkspace(
        new filterWorkspaceDetail({ id: filter.workspace_id })
      );
      if (checkList.status_code != StatusCodes.OK) {
        return new ResponseListData(
          {
            message: checkList.message,
            status_code: StatusCodes.BAD_REQUEST,
          },
          paginate
        );
      }
    }

    let custom_fields = await this.custom_field_repo.getListCustomField(
      filter.toFilterCustomFieldDetail(),
      paginate,
      user_id
    );
    return new ResponseListData(
      {
        message: "CustomField workspace",
        status_code: StatusCodes.OK,
        data: custom_fields.data!,
      },
      custom_fields.paginate
    );
  }

  async DeleteCustomField(
    filter: CustomFieldFilter
  ): Promise<ResponseData<null>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to delete",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    let errorFiled = filter.getErrorfield();
    if (errorFiled) {
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (filter.workspace_id) {
      let checkList = await this.workspace_repo.getWorkspace(
        new filterWorkspaceDetail({ id: filter.workspace_id })
      );
      if (checkList.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        });
      }
    }
    const deleteResponse = await this.custom_field_repo.deleteCustomField(
      filter
    );
    if (deleteResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "CustomField is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    return new ResponseData({
      message: "CustomField is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    });
  }

  async UpdateCustomField(
    filter: CustomFieldFilter,
    data: UpdateCustomFieldData
  ): Promise<ResponseData<null>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to update",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    if (data.isEmpty()) {
      return new ResponseData({
        message: "you need data to update",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    let errorFiled = filter.getErrorfield();
    if (errorFiled) {
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    errorFiled = data.getErrorfield();
    if (errorFiled) {
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    if (filter.workspace_id) {
      let checkList = await this.workspace_repo.getWorkspace(
        new filterWorkspaceDetail({ id: filter.workspace_id })
      );
      if (checkList.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        });
      }
    }

    if (filter.id) {
      let currentCustomField = await this.custom_field_repo.getCustomField({
        id: filter.id,
      });
      if (currentCustomField.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "CustomField is not found",
          status_code: StatusCodes.NOT_FOUND,
        });
      }

      // let checkCustomFieldName = await this.custom_field_repo.getCustomField({ __notId: filter.id, __orName: data.name, __orWorkspaceId: filter.workspace_id});
      // if (checkCustomFieldName.status_code == StatusCodes.OK) {
      //   return new ResponseData({
      //     message: "this workspace name already taken by others",
      //     status_code: StatusCodes.NOT_FOUND,
      //   })
      // }

      if (data.trigger_id) {
        const checkTrigger = await this.trigger_repo.getTrigger(
          new TriggerFilter({ id: data.trigger_id })
        );
        if (checkTrigger.status_code != StatusCodes.OK) {
          return new ResponseData({
            message: checkTrigger.message,
            status_code: checkTrigger.status_code,
          });
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
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    const updateResponse = await this.custom_field_repo.updateCustomField(
      filter.toFilterCustomFieldDetail(),
      data.toCustomFieldDetailUpdate()
    );
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "CustomField is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }

    return new ResponseData({
      message: "CustomField is updated successful",
      status_code: StatusCodes.NO_CONTENT,
    });
  }

  async GetListCardCustomField(
    workspace_id: string,
    card_id: string,
    user_id?: string
  ): Promise<ResponseData<Array<CardCustomFieldResponse>>> {
    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    const cardListCardCustomField =
      await this.custom_field_repo.getListCardCustomField(
        workspace_id,
        card_id,
        user_id
      );
    return cardListCardCustomField;
  }

  async SetCardCustomFieldValue(
    user_id: string,
    workspace_id: string,
    card_id: string,
    custom_field_id: string,
    data: CardCustomFieldValueUpdate,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<CardCustomFieldResponse>> {
    // Check if the record exists
    const findData = await this.custom_field_repo.getCardCustomField(
      workspace_id,
      card_id,
      custom_field_id
    );

    if (findData && findData.status_code === StatusCodes.OK && findData.data) {
      // Record exists, update it
      const updateResp = await this.custom_field_repo.updateCardCustomField(
        custom_field_id,
        card_id,
        data
      );

      if (updateResp.status_code === StatusCodes.NO_CONTENT) {
        // Get the updated record to return
        const updatedData = await this.custom_field_repo.getCardCustomField(
          workspace_id,
          card_id,
          custom_field_id
        );
        if (updatedData && updatedData.data) {
          // Broadcast WebSocket event for custom field update
          broadcastToWebSocket("custom_field:updated", {
            customField: updatedData.data,
            cardId: card_id,
            workspaceId: workspace_id,
          });

          // Publish user action event for automation
          if (this.event_publisher && triggerdBy === EnumTriggeredBy.User) {
            const eventData: any = {
              card: { id: card_id },
              previous_data: findData.data,
            };

            // Add all custom field properties to the event data
            if (updatedData.data) {
              Object.assign(eventData, updatedData.data);
            }

            // publish event
            const event: UserActionEvent = {
              eventId: uuidv4(),
              type: EnumUserActionEvent.CardCustomFieldChange,
              workspace_id: "",
              user_id: user_id,
              timestamp: new Date(),
              data: eventData,
            };
            console.log("Trying to publish event: %s", event.eventId);
            this.event_publisher.publishUserAction(event);
          }

          return new ResponseData({
            message: "CardCustomField value is updated successful",
            status_code: StatusCodes.NO_CONTENT,
            data: updatedData.data,
          });
        }
      }

      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to update card custom field"
      );
    } else {
      // Record doesn't exist, create it
      const createResp = await this.custom_field_repo.createCardCustomField(
        custom_field_id,
        card_id,
        data
      );

      if (createResp.status_code === StatusCodes.CREATED && createResp.data) {
        const fieldData = await this.custom_field_repo.getCardCustomField(
          workspace_id,
          card_id,
          custom_field_id
        );
        if (fieldData && fieldData.data) {
          // Broadcast WebSocket event for custom field creation
          // Broadcast WebSocket event for custom field creation
          broadcastToWebSocket("custom_field:updated", {
            customField: fieldData.data,
            cardId: card_id,
            workspaceId: workspace_id,
          });

          // Publish user action event for automation
          if (this.event_publisher) {
            const eventData: any = {
              card: { id: card_id },
            };

            // Add all custom field properties to the event data
            if (fieldData.data) {
              Object.assign(eventData, fieldData.data);
            }

            if (this.event_publisher && triggerdBy === EnumTriggeredBy.User) {
              // publish event
              const event: UserActionEvent = {
                eventId: uuidv4(),
                type: EnumUserActionEvent.CardCustomFieldChange,
                workspace_id: "",
                user_id: user_id,
                timestamp: new Date(),
                data: eventData,
              };
              console.Console;
              this.event_publisher.publishUserAction(event);
            }
          }

          return new ResponseData({
            message: "CardCustomField value is updated successful",
            status_code: StatusCodes.NO_CONTENT,
            data: fieldData.data,
          });
        }
      }

      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to create card custom field"
      );
    }
  }

  async GetCustomFieldOptions(
    customFieldId: string
  ): Promise<ResponseData<any[]>> {
    try {
      return await this.custom_field_repo.getCustomFieldOptions(customFieldId);
    } catch (error) {
      return new ResponseData({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : String(error),
        data: [],
      });
    }
  }
}
