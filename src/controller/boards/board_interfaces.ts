import { validate as isValidUUID } from "uuid";

import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import {
  BoardDetail,
  BoardDetailUpdate,
  filterBoardDetail,
} from "@/repository/board/board_interfaces";

export interface BoardControllerI {
  CreateBoard(
    user_id: string,
    data: BoardCreateData
  ): Promise<ResponseData<CreateBoardResponse>>;
  GetBoard(filter: BoardFilter): Promise<ResponseData<BoardResponse>>;
  GetListBoard(
    filter: BoardFilter,
    paginate: Paginate,
    userId?: string
  ): Promise<ResponseListData<Array<BoardResponse>>>;
  DeleteBoard(filter: BoardFilter): Promise<ResponseData<null>>;
  UpdateBoard(
    filter: BoardFilter,
    data: UpdateBoardData
  ): Promise<ResponseData<null>>;
}

export class CreateBoardResponse {
  id!: string;

  constructor(payload: Partial<CreateBoardResponse>) {
    Object.assign(this, payload);
  }
}

export class BoardResponse {
  id!: string;
  name?: string;
  description?: string;
  background?: string;
  roleIds?: string[];

  constructor(payload: Partial<BoardResponse>) {
    Object.assign(this, payload);
  }
}

export function fromBoardDetailToBoardResponse(
  data: BoardDetail
): BoardResponse {
  const response = new BoardResponse({
    id: data.id,
    name: data.name!,
    description: data.description,
    background: data.background,
  });

  // Add roleIds if they exist
  if (data.roleIds && data.roleIds.length > 0) {
    response.roleIds = [...data.roleIds];
  }

  return response;
}

export function fromBoardDetailToBoardResponseList(
  data: Array<BoardDetail>
): Array<BoardResponse> {
  let result: Array<BoardResponse> = [];
  for (const datum of data) {
    result.push(fromBoardDetailToBoardResponse(datum));
  }
  return result;
}

export class UpdateBoardData {
  name?: string;
  description?: string;
  background?: string;
  roleIds?: string[];

  constructor(payload: Partial<UpdateBoardData>) {
    Object.assign(this, payload);
    this.toBoardDetailUpdate = this.toBoardDetailUpdate.bind(this);
    this.isEmpty = this.isEmpty.bind(this);
  }

  isEmpty(): boolean {
    return (
      this.name == undefined &&
      this.description == undefined &&
      this.background == undefined
    );
  }

  toBoardDetailUpdate(): BoardDetailUpdate {
    return new BoardDetailUpdate({
      name: this.name,
      description: this.description,
      background: this.background,
      roleIds: this.roleIds,
    });
  }
}

export class BoardFilter {
  id?: string;
  name?: string;
  description?: string;
  workspace_id?: string;
  workspace_user_id_owner?: string;
  background?: string;

  constructor(payload: Partial<BoardFilter>) {
    Object.assign(this, payload);
    this.isEmpty = this.isEmpty.bind(this);
    this.toFilterBoardDetail = this.toFilterBoardDetail.bind(this);
  }

  toFilterBoardDetail(): filterBoardDetail {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      workspace_id: this.workspace_id,
      background: this.background,
    };
  }

  isEmpty(): boolean {
    return (
      this.id == undefined &&
      this.name == undefined &&
      this.description == undefined &&
      this.background == undefined
    );
  }
}

export class BoardCreateData {
  name!: string;
  description?: string;
  background?: string;
  workspace_id!: string;
  roleIds?: string[]; // Array of role IDs to assign to the board
  created_by?: string; // User ID of the creator
  updated_by?: string; // User ID of the last updater

  constructor(payload: Partial<BoardCreateData>) {
    Object.assign(this, payload);
    this.toBoardDetail = this.toBoardDetail.bind(this);
    this.checkRequired = this.checkRequired.bind(this);
    this.getErrorField = this.getErrorField.bind(this);
  }

  toBoardDetail(): BoardDetail {
    const boardDetail = new BoardDetail({
      name: this.name,
      description: this.description,
      background: this.background,
      workspace_id: this.workspace_id,
      created_by: this.created_by,
      updated_by: this.updated_by || this.created_by, // Default to created_by if updated_by not provided
    });

    // Add roleIds to the board detail if they exist
    if (this.roleIds && this.roleIds.length > 0) {
      (boardDetail as any).roleIds = this.roleIds;
    }

    return boardDetail;
  }

  checkRequired(): string | null {
    if (this.workspace_id == undefined) return "workspace_id";
    return null;
  }

  getErrorField(): string | null {
    if (this.workspace_id && !isValidUUID(this.workspace_id!)) {
      return "'workspace_id' is not valid uuid";
    }
    return null;
  }
}
