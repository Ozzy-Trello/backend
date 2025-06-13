import { validate as isValidUUID } from "uuid";

import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import {
  BoardControllerI,
  BoardCreateData,
  BoardFilter,
  BoardResponse,
  CreateBoardResponse,
  fromBoardDetailToBoardResponse,
  fromBoardDetailToBoardResponseList,
  UpdateBoardData,
} from "./board_interfaces";
import { BoardRepositoryI } from "@/repository/board/board_interfaces";
import {
  filterWorkspaceDetail,
  WorkspaceRepositoryI,
} from "@/repository/workspace/workspace_interfaces";
import { RoleRepositoryI } from "@/repository/role_access/role_interfaces";

export class BoardController implements BoardControllerI {
  private board_repo: BoardRepositoryI;
  private role_access_repo: RoleRepositoryI;
  private workspace_repo: WorkspaceRepositoryI;

  constructor(
    board_repo: BoardRepositoryI,
    workspace_repo: WorkspaceRepositoryI,
    role_access_repo: RoleRepositoryI
  ) {
    this.board_repo = board_repo;
    this.workspace_repo = workspace_repo;
    this.role_access_repo = role_access_repo;
    this.GetBoard = this.GetBoard.bind(this);
    this.GetListBoard = this.GetListBoard.bind(this);
    this.DeleteBoard = this.DeleteBoard.bind(this);
    this.UpdateBoard = this.UpdateBoard.bind(this);
    this.CreateBoard = this.CreateBoard.bind(this);
  }

  async CreateBoard(
    user_id: string,
    data: BoardCreateData
  ): Promise<ResponseData<CreateBoardResponse>> {
    let paylodCheck = data.checkRequired();
    if (paylodCheck) {
      return new ResponseData({
        message: `you need to put '${paylodCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let workspaceFilter = new filterWorkspaceDetail({ id: data.workspace_id });
    if (!isValidUUID(workspaceFilter.id!)) {
      delete workspaceFilter.id;
      workspaceFilter.slug = data.workspace_id;
    }

    let workspace = await this.workspace_repo.getWorkspace(workspaceFilter);
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
    data.workspace_id = workspace.data?.id!;

    let checkBoard = await this.board_repo.getBoard({
      workspace_id: workspace.data?.id!,
      name: data.name,
    });
    if (checkBoard.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "board name already exist in your workspace",
        status_code: StatusCodes.CONFLICT,
      });
    }

    let defaultRole = await this.role_access_repo.getRole({
      default: true,
      createDefaultWhenNone: true,
    });
    if (
      !(
        defaultRole.status_code == StatusCodes.OK ||
        defaultRole.status_code == StatusCodes.CREATED
      )
    ) {
      return new ResponseData({
        message: defaultRole.message,
        status_code: defaultRole.status_code,
      });
    }

    let createResponse = await this.board_repo.createBoard(
      data.toBoardDetail()
    );
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    // let addMemberResponse = await this.board_repo.addMember(createResponse.data!.id!, user_id, defaultRole.data?.id!);
    // if (addMemberResponse != StatusCodes.NO_CONTENT) {
    //   return new ResponseData({
    //     message: "error to sign user as board owner",
    //     status_code: StatusCodes.INTERNAL_SERVER_ERROR,
    //   })
    // }

    return new ResponseData({
      message: "Board created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateBoardResponse({
        id: createResponse.data?.id,
      }),
    });
  }

  async GetBoard(filter: BoardFilter): Promise<ResponseData<BoardResponse>> {
    if (filter.workspace_id && filter.workspace_user_id_owner) {
      return new ResponseData({
        message:
          "you cant use filter `worksace-id` while using `my-default` filter",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (filter.workspace_id) {
      let workspaceFilter = new filterWorkspaceDetail({
        id: filter.workspace_id,
      });
      if (!isValidUUID(workspaceFilter.id!)) {
        delete workspaceFilter.id;
        workspaceFilter.slug = filter.workspace_id;
        delete filter.workspace_id;
      }
      if (
        filter.workspace_user_id_owner &&
        isValidUUID(filter.workspace_user_id_owner!)
      ) {
        workspaceFilter.user_id_owner = filter.workspace_user_id_owner;
        delete filter.workspace_user_id_owner;
      }

      let workspace = await this.workspace_repo.getWorkspace(workspaceFilter);
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
      filter.workspace_id = workspace.data?.id!;
    }

    let checkBoard = await this.board_repo.getBoard(
      filter.toFilterBoardDetail()
    );
    if (checkBoard.status_code == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: checkBoard.message,
        status_code: checkBoard.status_code,
      });
    }
    return new ResponseData({
      message: checkBoard.message,
      status_code: checkBoard.status_code,
      data: fromBoardDetailToBoardResponse(checkBoard.data!),
    });
  }

  async GetListBoard(
    filter: BoardFilter,
    paginate: Paginate
  ): Promise<ResponseListData<Array<BoardResponse>>> {
    if (filter.workspace_id && filter.workspace_user_id_owner) {
      return new ResponseListData(
        {
          message:
            "you cant use filter `worksace-id` while using `my-default` filter",
          status_code: StatusCodes.BAD_REQUEST,
          data: [],
        },
        paginate
      );
    }
    if (filter.workspace_id || filter.workspace_user_id_owner) {
      let workspaceFilter = new filterWorkspaceDetail({
        id: filter.workspace_id,
        user_id_owner: filter.workspace_user_id_owner,
      });
      if (workspaceFilter.id && !isValidUUID(workspaceFilter.id!)) {
        delete workspaceFilter.id;
        workspaceFilter.slug = filter.workspace_id;
        delete filter.workspace_id;
      }
      if (
        filter.workspace_user_id_owner &&
        isValidUUID(filter.workspace_user_id_owner!)
      ) {
        workspaceFilter.user_id_owner = filter.workspace_user_id_owner;
        delete filter.workspace_user_id_owner;
      }

      let workspace = await this.workspace_repo.getWorkspace(workspaceFilter);
      if (workspace.status_code != StatusCodes.OK) {
        let msg = "internal server error";
        if (workspace.status_code == StatusCodes.NOT_FOUND) {
          msg = "workspace is not found";
        }
        return new ResponseListData(
          {
            message: msg,
            status_code: StatusCodes.BAD_REQUEST,
            data: [],
          },
          paginate
        );
      }
      filter.workspace_id = workspace.data?.id!;
    }

    let boards = await this.board_repo.getBoardList(
      filter.toFilterBoardDetail(),
      paginate
    );
    return new ResponseListData(
      {
        message: "board list",
        status_code: StatusCodes.OK,
        data: fromBoardDetailToBoardResponseList(boards.data!),
      },
      boards.paginate
    );
  }

  async DeleteBoard(filter: BoardFilter): Promise<ResponseData<null>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to delete",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    if (filter.workspace_id && filter.workspace_user_id_owner) {
      return new ResponseData({
        message:
          "you cant use filter `worksace-id` while using `my-default` filter",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (filter.workspace_id) {
      let workspaceFilter = new filterWorkspaceDetail({
        id: filter.workspace_id,
      });
      if (!isValidUUID(workspaceFilter.id!)) {
        delete workspaceFilter.id;
        workspaceFilter.slug = filter.workspace_id;
        delete filter.workspace_id;
      }
      if (
        filter.workspace_user_id_owner &&
        isValidUUID(filter.workspace_user_id_owner!)
      ) {
        workspaceFilter.user_id_owner = filter.workspace_user_id_owner;
        delete filter.workspace_user_id_owner;
      }

      let workspace = await this.workspace_repo.getWorkspace(workspaceFilter);
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
      filter.workspace_id = workspace.data?.id!;
    }
    const deleteResponse = await this.board_repo.deleteBoard(filter);
    if (deleteResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Board is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    return new ResponseData({
      message: "Board is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    });
  }

  async UpdateBoard(
    filter: BoardFilter,
    data: UpdateBoardData
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
    if (filter.workspace_id && filter.workspace_user_id_owner) {
      return new ResponseData({
        message:
          "you cant use filter `worksace-id` while using `my-default` filter",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    if (filter.workspace_id) {
      let workspaceFilter = new filterWorkspaceDetail({
        id: filter.workspace_id,
      });
      if (!isValidUUID(workspaceFilter.id!)) {
        delete workspaceFilter.id;
        workspaceFilter.slug = filter.workspace_id;
        delete filter.workspace_id;
      }
      if (
        filter.workspace_user_id_owner &&
        isValidUUID(filter.workspace_user_id_owner!)
      ) {
        workspaceFilter.user_id_owner = filter.workspace_user_id_owner;
        delete filter.workspace_user_id_owner;
      }

      let workspace = await this.workspace_repo.getWorkspace(workspaceFilter);
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
      filter.workspace_id = workspace.data?.id!;
    }

    if (filter.id) {
      let currentBoard = await this.board_repo.getBoard({ id: filter.id });
      if (currentBoard.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "Board is not found",
          status_code: StatusCodes.NOT_FOUND,
        });
      }

      let checkBoard = await this.board_repo.getBoard({
        __notId: filter.id,
        __orName: data.name,
      });
      if (checkBoard.status_code == StatusCodes.OK) {
        return new ResponseData({
          message: "this board name already taken by others",
          status_code: StatusCodes.NOT_FOUND,
        });
      }
    }

    const updateResponse = await this.board_repo.updateBoard(
      filter.toFilterBoardDetail(),
      data.toBoardDetailUpdate()
    );
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Board is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    return new ResponseData({
      message: "Board is updated successful",
      status_code: StatusCodes.NO_CONTENT,
    });
  }
}
