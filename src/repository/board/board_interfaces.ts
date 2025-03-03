import {ResponseData} from "@/utils/response_utils";

export interface BoardRepositoryI {
  getBoard(filter: filterBoardDetail): Promise<ResponseData<BoardDetail>>;
  createBoard(data: BoardDetail): Promise<ResponseData<BoardDetail>>;
  deleteBoard(filter: filterBoardDetail): Promise<number>;
  updateBoard(filter: filterBoardDetail, data: BoardDetailUpdate): Promise<number>;
  getBoardList(filter: filterBoardDetail): Promise<Array<BoardDetail>>;
}

export interface filterBoardDetail {
  id?: string;
  workspace_id?: string;
  name?: string;
  description?: string;
  background?: string;
}

export class BoardDetailUpdate {
  public workspace_id?: string;
  public name?: string;
  public description?: string;
  public background?: string;

  constructor(payload: Partial<BoardDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.workspace_id) data.workspace_id = this.workspace_id;
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    if (this.background) data.background = this.background;
    return data
  }
}

export class BoardDetail {
  public id?: string;
  public workspace_id?: string;
  public name?: string;
  public description?: string;
  public background?: string;

  constructor(payload: Partial<BoardDetail>) {
    Object.assign(this, payload);
  }
}
