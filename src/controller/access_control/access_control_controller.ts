import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import { AccessControlControllerI, AccessControlCreateData, AccessControlFilter, AccessControlResponse, CreateAccessControlResponse, fromRoleDetailToAccessControlResponse, fromRoleDetailToAccessControlResponseList, UpdateAccessControlData } from "./access_control_interfaces";
import { RoleRepositoryI, filterRoleDetail  } from "@/repository/role_access/role_interfaces";
import { RepositoryContext } from "@/repository/repository_context";

export class AccessControlController implements AccessControlControllerI {
  private repository_context: RepositoryContext

  constructor(repository_context: RepositoryContext) {
    this.repository_context = repository_context;

    this.GetAccessControl = this.GetAccessControl.bind(this);
    this.GetAccessControlList = this.GetAccessControlList.bind(this);
    this.DeleteAccessControl = this.DeleteAccessControl.bind(this);
    this.UpdateAccessControl = this.UpdateAccessControl.bind(this);
    this.CreateAccessControl = this.CreateAccessControl.bind(this);
  }

  async CreateAccessControl(user_id: string, data: AccessControlCreateData): Promise<ResponseData<CreateAccessControlResponse>> {
    let errorField = data.getErrorField()
    if (data.isEmpty()) {
      return new ResponseData({
        message: "you need data to create",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let checkAccessControl = await this.repository_context.role.getRole({ name: data.name });
    if (checkAccessControl.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "the name already taken by others",
        status_code: StatusCodes.CONFLICT,
      })
    }

    let createResponse = await this.repository_context.role.createRole(data.toRoleDetail());
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    return new ResponseData({
      message: "Role created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateAccessControlResponse({
        id: createResponse.data?.id,
      }),
    })
  }

  async GetAccessControl(filter: AccessControlFilter): Promise<ResponseData<AccessControlResponse>> {
    let checkAccessControl = await this.repository_context.role.getRole(filter.toFilterRoleDetail());
    if (checkAccessControl.status_code == StatusCodes.NOT_FOUND){
      return new ResponseData({
        message: checkAccessControl.message,
        status_code: checkAccessControl.status_code,
      })  
    }
    return new ResponseData({
      message: checkAccessControl.message,
      status_code: checkAccessControl.status_code,
      data: fromRoleDetailToAccessControlResponse(checkAccessControl.data!),
    })
  }

  async GetAccessControlList(filter: AccessControlFilter, paginate: Paginate): Promise<ResponseListData<Array<AccessControlResponse>>> {
    let access_controls = await this.repository_context.role.getRoleList(filter.toFilterRoleDetail(), paginate);
    return new ResponseListData({
      message: "access_control list",
      status_code: StatusCodes.OK,
      data: fromRoleDetailToAccessControlResponseList(access_controls.data!),
    }, access_controls.paginate)
  }

  async DeleteAccessControl(filter: AccessControlFilter): Promise<ResponseData<null>> {
    let checkAccessControl = await this.repository_context.role.getRole(filter.toFilterRoleDetail());
    if (checkAccessControl.status_code == StatusCodes.NOT_FOUND){
      return new ResponseData({
        message: checkAccessControl.message,
        status_code: checkAccessControl.status_code,
      })
    }
    if (checkAccessControl.data?.default){
      return new ResponseData({
        message: "Can't update default role",
        status_code: StatusCodes.FORBIDDEN,
      })  
    }
    const deleteResponse = await this.repository_context.role.deleteRole(filter);
    if (deleteResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Role is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "Role is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }

  async UpdateAccessControl(filter: AccessControlFilter, data: UpdateAccessControlData): Promise<ResponseData<null>> {
    let errorField = data.getErrorField()
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to update",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    if (data.isEmpty()) {
      return new ResponseData({
        message: "you need data to create",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    if (filter.id) {
      let currentAccessControl = await this.repository_context.role.getRole({ id: filter.id });
      if (currentAccessControl.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "AccessControl is not found",
          status_code: StatusCodes.NOT_FOUND,
        })
      }

      let checkAccessControl = await this.repository_context.role.getRole({ __notId: filter.id, __orName: data.name });
      if (checkAccessControl.status_code == StatusCodes.OK) {
        return new ResponseData({
          message: "this access_control name already taken by others",
          status_code: StatusCodes.NOT_FOUND,
        })
      }
    }

    const updateResponse = await this.repository_context.role.updateRole(filter.toFilterRoleDetail(), data.toRoleDetailUpdate());
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "AccessControl is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "AccessControl is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }
}