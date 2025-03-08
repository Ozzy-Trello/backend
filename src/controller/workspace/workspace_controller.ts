import { filterWorkspaceDetail, WorkspaceRepositoryI } from "@/repository/workspace/workspace_interfaces";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import {
  CreateWorkspaceResponse,
  fromWorkspaceDetailToWorkspaceResponse,
  fromWorkspaceDetailToWorkspaceResponseList,
  UpdateWorkspaceData, WorkspaceControllerI, WorkspaceCreateData, WorkspaceFilter, WorkspaceResponse
} from "./workspace_interfaces";
import { RoleRepositoryI } from "@/repository/role_access/role_interfaces";

export class WorkspaceController implements WorkspaceControllerI {
  private workspace_repo: WorkspaceRepositoryI
  private role_access_repo: RoleRepositoryI

  constructor(workspace_repo: WorkspaceRepositoryI, role_access_repo: RoleRepositoryI) {
    this.workspace_repo = workspace_repo;
    this.role_access_repo = role_access_repo;
    this.GetWorkspace = this.GetWorkspace.bind(this);
    this.GetWorkspaceList = this.GetWorkspaceList.bind(this);
    this.DeleteWorkspace = this.DeleteWorkspace.bind(this);
    this.UpdateWorkspace = this.UpdateWorkspace.bind(this);
    this.CreateWorkspace = this.CreateWorkspace.bind(this);
  }

  async CreateWorkspace(user_id: string, data: WorkspaceCreateData): Promise<ResponseData<CreateWorkspaceResponse>> {
    if (data.isEmpty()) {
      return new ResponseData({
        message: "you need data to create",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let checkWorkspace = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail({ slug: data.slug }));
    if (checkWorkspace.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "this workspace slug already taken by others",
        status_code: StatusCodes.CONFLICT,
      })
    }

    let createResponse = await this.workspace_repo.createWorkspace(data.toWorkspaceDetail());
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    let defaultRole = await this.role_access_repo.getRole({
      default: true, 
      createWhenNone: true, 
      name: "default", 
      description: "default role",
    });
    if (!(defaultRole.status_code == StatusCodes.OK || defaultRole.status_code == StatusCodes.CREATED)) {
      return new ResponseData({
        message: defaultRole.message,
        status_code: defaultRole.status_code,
      })
    }

    let addMemberResponse = await this.workspace_repo.addMember(createResponse.data!.id!, user_id, defaultRole.data?.id!);
    if (addMemberResponse != StatusCodes.NO_CONTENT) {
      return new ResponseData({
        message: "error to sign user as workspace owner",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    return new ResponseData({
      message: "Workspace created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateWorkspaceResponse({
        id: createResponse.data?.id,
      }),
    })
  }

  async GetWorkspace(filter: WorkspaceFilter): Promise<ResponseData<WorkspaceResponse>> {
    let errorField = filter.getErrorField()
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    let checkWorkspace = await this.workspace_repo.getWorkspace(filter.toFilterWorkspaceDetail());
    if (checkWorkspace.status_code == StatusCodes.NOT_FOUND){
      return new ResponseData({
        message: checkWorkspace.message,
        status_code: checkWorkspace.status_code,
      })  
    }
    return new ResponseData({
      message: checkWorkspace.message,
      status_code: checkWorkspace.status_code,
      data: fromWorkspaceDetailToWorkspaceResponse(checkWorkspace.data!),
    })
  }

  async GetWorkspaceList(filter: WorkspaceFilter, paginate: Paginate): Promise<ResponseListData<Array<WorkspaceResponse>>> {
    let workspaces = await this.workspace_repo.getWorkspaceList(filter.toFilterWorkspaceDetail(), paginate);
    return new ResponseListData({
      message: "workspace list",
      status_code: StatusCodes.OK,
      data: fromWorkspaceDetailToWorkspaceResponseList(workspaces.data!),
    }, workspaces.paginate)
  }

  async DeleteWorkspace(filter: WorkspaceFilter): Promise<ResponseData<null>> {
    let errorField = filter.getErrorField()
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    const deleteResponse = await this.workspace_repo.deleteWorkspace(filter);
    if (deleteResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Workspace is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "Workspace is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }

  async UpdateWorkspace(filter: WorkspaceFilter, data: UpdateWorkspaceData): Promise<ResponseData<null>> {
    let errorField = filter.getErrorField()
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
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    if (filter.user_id_owner) {
      let workspaceByUser = await this.GetWorkspace(new WorkspaceFilter({user_id_owner: filter.user_id_owner}));
      if (workspaceByUser.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: workspaceByUser.message,
          status_code: StatusCodes.NOT_FOUND,
        })
      }
      filter.id = workspaceByUser.data?.id!
    }

    if (filter.id) {
      let currentWorkspace = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail({ id: filter.id }));
      if (currentWorkspace.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "Workspace is not found",
          status_code: StatusCodes.NOT_FOUND,
        })
      }

      let checkWorkspace = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail({ __notId: filter.id, __orName: data.name }));
      if (checkWorkspace.status_code == StatusCodes.OK) {
        return new ResponseData({
          message: "this workspace name already taken by others",
          status_code: StatusCodes.NOT_FOUND,
        })
      }
    }

    const updateResponse = await this.workspace_repo.updateWorkspace(filter.toFilterWorkspaceDetail(), data.toWorkspaceDetailUpdate());
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Workspace is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "Workspace is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }
}