import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";

export interface BoardRepositoryI {
  getBoard(filter: filterBoardDetail): Promise<ResponseData<BoardDetail>>;
  addMember(id: string, user_id: string, role_id: string): Promise<number>;
  removeMember(id: string, user_id: string): Promise<number>
  isMember(id: string, user_id: string): Promise<number>
  createBoard(data: BoardDetail): Promise<ResponseData<BoardDetail>>;
  deleteBoard(filter: filterBoardDetail): Promise<number>;
  updateBoard(filter: filterBoardDetail, data: BoardDetailUpdate): Promise<number>;
  getBoardList(filter: filterBoardDetail, paginate: Paginate): Promise<ResponseListData<Array<BoardDetail>>>;
}

export interface filterBoardDetail {
  id?: string;
  name?: string;
  description?: string;
  background?: string;
  workspace_id?: string;

  __orId?: string;
  __orName?: string;
  __orDescription?: string;
  __orWorkspaceId?: string;

  __notId?: string;
  __notName?: string;
  __notDescription?: string;
  __notWorkspaceId?: string;
}

export class BoardDetailUpdate {
  public name?: string;
  public description?: string;
  public background?: string;;

  constructor(payload: Partial<BoardDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    if (this.background) data.background = this.background;
    return data
  }
}

export class BoardDetail {
  public id!: string;
  public name?: string;
  public description?: string;
  public background?: string;
  public workspace_id!: string;

  constructor(payload: Partial<BoardDetail>) {
    Object.assign(this, payload);
  }
}
