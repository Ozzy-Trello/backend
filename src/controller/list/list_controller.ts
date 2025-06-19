import { validate as isValidUUID, v4 as uuidv4 } from "uuid";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import { ListRepositoryI } from "@/repository/list/list_interfaces";
import {
  CreateListResponse,
  fromListDetailToListResponse,
  fromListDetailToListResponseList,
  ListControllerI,
  ListCreateData,
  ListFilter,
  ListMoveData,
  ListResponse,
  UpdateListData,
} from "@/controller/list/list_interfaces";
import { BoardRepositoryI } from "@/repository/board/board_interfaces";
import { broadcastToWebSocket } from "@/server";
import { EnumTriggeredBy, EnumUserActionEvent, UserActionEvent } from "@/types/event";
import { AutomationRuleControllerI } from "../automation_rule/automation_rule_interface";
import { EventPublisher } from "@/event_publisher";

export class ListController implements ListControllerI {
  private list_repo: ListRepositoryI;
  private board_repo: BoardRepositoryI;
  private event_publisher: EventPublisher | undefined;
  private automation_rule_controller: AutomationRuleControllerI | undefined;


  constructor(list_repo: ListRepositoryI, board_repo: BoardRepositoryI) {
    this.list_repo = list_repo;
    this.board_repo = board_repo;
    this.GetList = this.GetList.bind(this);
    this.GetListList = this.GetListList.bind(this);
    this.DeleteList = this.DeleteList.bind(this);
    this.UpdateList = this.UpdateList.bind(this);
    this.CreateList = this.CreateList.bind(this);
    this.MoveList = this.MoveList.bind(this);
  }

  SetAutomationRuleController(
    automation_rule_controller: AutomationRuleControllerI
  ): void {
    this.automation_rule_controller = automation_rule_controller;
  }

  SetEventPublisher(event_publisher: EventPublisher): void {
    this.event_publisher = event_publisher;
  }

  async CreateList(
    user_id: string,
    data: ListCreateData,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<CreateListResponse>> {
    let paylodCheck = data.checkRequired();
    if (paylodCheck) {
      return new ResponseData({
        message: `you need to put '${paylodCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let errorField = data.getErrorField();
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let workspace = await this.board_repo.getBoard({ id: data.board_id });
    if (workspace.status_code != StatusCodes.OK) {
      let msg = "internal server error";
      if (workspace.status_code == StatusCodes.NOT_FOUND) {
        msg = "board is not found";
      }
      return new ResponseData({
        message: msg,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let checkBoard = await this.list_repo.getList({
      board_id: data.board_id,
      name: data.name,
    });
    if (checkBoard.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "list name already exist on your board",
        status_code: StatusCodes.CONFLICT,
      });
    }
    data.created_by = user_id;
    let createResponse = await this.list_repo.createList(data.toListDetail());
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    /**
     * Do async procedures
     * 1. Broadcast websocket event
     * 2. Publish useractionevent
     */

    // Broadcast to WebSocket clients
    broadcastToWebSocket(EnumUserActionEvent.ListCreated, {
      list: createResponse.data,
      boardId: createResponse.data?.board_id,
      createdBy: user_id,
    });

    if (this.event_publisher && triggerdBy === EnumTriggeredBy.User) {
      const event: UserActionEvent = {
        eventId: uuidv4(),
        type: EnumUserActionEvent.ListCreated,
        workspace_id: "",
        user_id: user_id,
        timestamp: new Date(),
        data: {
          list: {
            id: createResponse?.data?.id,
            board_id: createResponse?.data?.board_id
          },
          board: {
            id: createResponse?.data?.board_id
          }
        },
      }
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);
    }

    return new ResponseData({
      message: "List created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateListResponse({
        id: createResponse.data?.id,
      }),
    });
  }

  async GetList(filter: ListFilter): Promise<ResponseData<ListResponse>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need to put filter to get list data",
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

    if (filter.board_id) {
      let checkBoard = await this.board_repo.getBoard({ id: filter.board_id });
      if (checkBoard.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: checkBoard.message,
          status_code: checkBoard.status_code,
        });
      }
    }

    let checkBoard = await this.list_repo.getList(filter.toFilterListDetail());
    if (checkBoard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkBoard.message,
        status_code: checkBoard.status_code,
      });
    }

    return new ResponseData({
      message: checkBoard.message,
      status_code: checkBoard.status_code,
      data: fromListDetailToListResponse(checkBoard.data!),
    });
  }

  async GetListList(
    filter: ListFilter,
    paginate: Paginate
  ): Promise<ResponseListData<Array<ListResponse>>> {
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

    if (filter.board_id) {
      let checkBoard = await this.board_repo.getBoard({ id: filter.board_id });
      if (checkBoard.status_code != StatusCodes.OK) {
        return new ResponseListData(
          {
            message: checkBoard.message,
            status_code: StatusCodes.BAD_REQUEST,
          },
          paginate
        );
      }
    }

    let boards = await this.list_repo.getListList(
      filter.toFilterListDetail(),
      paginate
    );
    return new ResponseListData(
      {
        message: "List list",
        status_code: StatusCodes.OK,
        data: fromListDetailToListResponseList(boards.data!),
      },
      boards.paginate
    );
  }

  async DeleteList(filter: ListFilter): Promise<ResponseData<null>> {
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
    if (filter.board_id) {
      let checkBoard = await this.board_repo.getBoard({ id: filter.board_id });
      if (checkBoard.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: checkBoard.message,
          status_code: StatusCodes.BAD_REQUEST,
        });
      }
    }
    const deleteResponse = await this.list_repo.deleteList(filter);
    if (deleteResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "List is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    return new ResponseData({
      message: "List is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    });
  }

  async UpdateList(
    filter: ListFilter,
    data: UpdateListData
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

    if (filter.board_id) {
      let checkBoard = await this.board_repo.getBoard({ id: filter.board_id });
      if (checkBoard.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: checkBoard.message,
          status_code: StatusCodes.BAD_REQUEST,
        });
      }
    }

    if (filter.id) {
      let currentBoard = await this.list_repo.getList({ id: filter.id });
      if (currentBoard.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "List is not found",
          status_code: StatusCodes.NOT_FOUND,
        });
      }

      let checkBoard = await this.list_repo.getList({
        __notId: filter.id,
        __orName: data.name,
      });
      if (checkBoard.status_code == StatusCodes.OK) {
        return new ResponseData({
          message: "this list name already taken by others",
          status_code: StatusCodes.NOT_FOUND,
        });
      }
    }

    const updateResponse = await this.list_repo.updateList(
      filter.toFilterListDetail(),
      data.toListDetailUpdate()
    );
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "List is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    return new ResponseData({
      message: "List is updated successful",
      status_code: StatusCodes.NO_CONTENT,
    });
  }

  async MoveList(
    user_id: string,
    filter: ListMoveData
  ): Promise<ResponseData<ListResponse>> {
    try {
      // 1. Validate list ID
      if (!filter.id || !isValidUUID(filter.id)) {
        return new ResponseData({
          message: "List ID is invalid or missing",
          status_code: StatusCodes.BAD_REQUEST,
        });
      }

      // 2. Get the current list information before move
      const card = await this.list_repo.getList({ id: filter.id });
      if (card.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: card.message,
          status_code: card.status_code,
        });
      }

      // 3. Call the repository's moveList function
      const moveResponse = await this.list_repo.moveList({
        id: filter.id,
        previous_position: filter.previous_position,
        target_position: filter.target_position,
        board_id: filter.board_id,
      });

      if (moveResponse.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: moveResponse.message,
          status_code: moveResponse.status_code,
        });
      }

      // 4. Return the moved card data
      return new ResponseData({
        message: "List moved successfully",
        status_code: StatusCodes.OK,
        data: moveResponse.data,
      });
    } catch (e) {
      if (e instanceof Error) {
        return new ResponseData({
          message: e.message,
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }
      return new ResponseData({
        message: "Internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
