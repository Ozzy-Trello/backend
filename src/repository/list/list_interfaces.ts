import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";

export interface ListRepositoryI {
  getList(filter: filterListDetail): Promise<ResponseData<ListDetail>>;
  createList(data: ListDetail): Promise<ResponseData<ListDetail>>;
  deleteList(filter: filterListDetail): Promise<number>;
  updateList(filter: filterListDetail, data: ListDetailUpdate): Promise<number>;
  getListList(filter: filterListDetail, paginate: Paginate): Promise<ResponseListData<Array<ListDetail>>>;
}

export interface filterListDetail {
  id?: string;
  name?: string;
  background?: string;
  workspace_id?: string;
  board_id?: string;

  __orId?: string;
  __orName?: string;
  __orWorkspaceId?: string;
  __orBoardId?: string;

  __notId?: string;
  __notName?: string;
  __notWorkspaceId?: string;
  __notBoardId?: string;
}

export class ListDetailUpdate {
  public name?: string;
  public background?: string;
  public workspace_id?: string;
  public board_id?: string;

  constructor(payload: Partial<ListDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.background) data.background = this.background;
    if (this.workspace_id) data.workspace_id = this.workspace_id;
    if (this.board_id) data.board_id = this.workspace_id;
    return data
  }
}

export class ListDetail {
  public id!: string;
  public name?: string;
  public background?: string;
  public workspace_id!: string;
  public board_id!: string;
  public order!: number;

  constructor(payload: Partial<ListDetail>) {
    Object.assign(this, payload);
  }
}
