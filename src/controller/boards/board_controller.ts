import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import { BoardControllerI, BoardCreateData, BoardFilter, BoardResponse, CreateBoardResponse, fromBoardDetailToBoardResponse, fromBoardDetailToBoardResponseList, UpdateBoardData } from "./board_interfaces";
import { BoardRepositoryI } from "@/repository/board/board_interfaces";
import { filterWorkspaceDetail, WorkspaceRepositoryI } from "@/repository/workspace/workspace_interfaces";

export class BoardController implements BoardControllerI {
  private board_repo: BoardRepositoryI
  private workspace_repo: WorkspaceRepositoryI

  constructor(board_repo: BoardRepositoryI, workspace_repo: WorkspaceRepositoryI) {
    this.board_repo = board_repo;
    this.workspace_repo = workspace_repo;
    this.GetBoard = this.GetBoard.bind(this);
    this.GetBoardList = this.GetBoardList.bind(this);
    this.DeleteBoard = this.DeleteBoard.bind(this);
    this.UpdateBoard = this.UpdateBoard.bind(this);
    this.CreateBoard = this.CreateBoard.bind(this);
  }

  async CreateBoard(user_id: string, data: BoardCreateData): Promise<ResponseData<CreateBoardResponse>> {
    let paylodCheck = data.checkRequired();
    if (paylodCheck) {
      return new ResponseData({
        message: `you need to put '${paylodCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let workspace = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail({id: data.workspace_id}))
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

    let checkBoard = await this.board_repo.getBoard({ name: data.name });
    if (checkBoard.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "you already name already taken by others",
        status_code: StatusCodes.CONFLICT,
      })
    }

    let createResponse = await this.board_repo.createBoard(data.toBoardDetail());
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    let addMemberResponse = await this.board_repo.addMember(createResponse.data!.id!, user_id, "2147fece-408f-44ad-99b0-6b146b38d8c2");
    if (addMemberResponse != StatusCodes.NO_CONTENT) {
      return new ResponseData({
        message: "error to sign user as board owner",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    return new ResponseData({
      message: "Board created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateBoardResponse({
        id: createResponse.data?.id,
      }),
    })
  }

  async GetBoard(filter: BoardFilter): Promise<ResponseData<BoardResponse>> {
    let checkBoard = await this.board_repo.getBoard(filter.toFilterBoardDetail());
    if (checkBoard.status_code == StatusCodes.NOT_FOUND){
      return new ResponseData({
        message: checkBoard.message,
        status_code: checkBoard.status_code,
      })  
    }
    return new ResponseData({
      message: checkBoard.message,
      status_code: checkBoard.status_code,
      data: fromBoardDetailToBoardResponse(checkBoard.data!),
    })
  }

  async GetBoardList(filter: BoardFilter, paginate: Paginate): Promise<ResponseListData<Array<BoardResponse>>> {
    let boards = await this.board_repo.getBoardList(filter.toFilterBoardDetail(), paginate);
    return new ResponseListData({
      message: "board list",
      status_code: StatusCodes.OK,
      data: fromBoardDetailToBoardResponseList(boards.data!),
    }, boards.paginate)
  }

  async DeleteBoard(filter: BoardFilter): Promise<ResponseData<null>> {
    const deleteResponse = await this.board_repo.deleteBoard(filter);
    if (deleteResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Board is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "Board is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }

  async UpdateBoard(filter: BoardFilter, data: UpdateBoardData): Promise<ResponseData<null>> {
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

    if (filter.id) {
      let currentBoard = await this.board_repo.getBoard({ id: filter.id });
      if (currentBoard.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "Board is not found",
          status_code: StatusCodes.NOT_FOUND,
        })
      }

      let checkBoard = await this.board_repo.getBoard({ __notId: filter.id, __orName: data.name });
      if (checkBoard.status_code == StatusCodes.OK) {
        return new ResponseData({
          message: "this board name already taken by others",
          status_code: StatusCodes.NOT_FOUND,
        })
      }
    }

    const updateResponse = await this.board_repo.updateBoard(filter.toFilterBoardDetail(), data.toBoardDetailUpdate());
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Board is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "Board is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }
}