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
import { RepositoryContext } from "@/repository/repository_context";

export class WorkspaceController implements WorkspaceControllerI {
  private repository_context: RepositoryContext

  constructor(repository_context: RepositoryContext) {
    this.repository_context = repository_context;
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

    let paylodCheck = data.checkRequired();
    if (paylodCheck) {
      return new ResponseData({
        message: `you need to put '${paylodCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let checkWorkspace = await this.repository_context.workspace.getWorkspace(new filterWorkspaceDetail({ slug: data.slug }));
    if (checkWorkspace.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "the slug is already taken by others",
        status_code: StatusCodes.CONFLICT,
      })
    }

    let checkAccount = await this.repository_context.user.getUser({id: user_id});
    if (checkAccount.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: "user is not found",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let defaultRole = await this.repository_context.role.getRole({
      default: true, 
      createDefaultWhenNone: true,
    });
    if (!(defaultRole.status_code == StatusCodes.OK || defaultRole.status_code == StatusCodes.CREATED)) {
      return new ResponseData({
        message: defaultRole.message,
        status_code: defaultRole.status_code,
      })
    }

    let createResponse = await this.repository_context.workspace.createWorkspace(data.toWorkspaceDetail());
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    let addMemberResponse = await this.repository_context.workspace.addMember(createResponse.data!.id!, user_id, defaultRole.data?.id!);
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
    let checkWorkspace = await this.repository_context.workspace.getWorkspace(filter.toFilterWorkspaceDetail());
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
    let workspaces = await this.repository_context.workspace.getWorkspaceList(filter.toFilterWorkspaceDetail(), paginate);
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
    const deleteResponse = await this.repository_context.workspace.deleteWorkspace(filter);
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
      let currentWorkspace = await this.repository_context.workspace.getWorkspace(new filterWorkspaceDetail({ id: filter.id }));
      if (currentWorkspace.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "Workspace is not found",
          status_code: StatusCodes.NOT_FOUND,
        })
      }

      let checkWorkspace = await this.repository_context.workspace.getWorkspace(new filterWorkspaceDetail({ __notId: filter.id, __orName: data.name }));
      if (checkWorkspace.status_code == StatusCodes.OK) {
        return new ResponseData({
          message: "this workspace name already taken by others",
          status_code: StatusCodes.NOT_FOUND,
        })
      }
    }

    const updateResponse = await this.repository_context.workspace.updateWorkspace(filter.toFilterWorkspaceDetail(), data.toWorkspaceDetailUpdate());
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