import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";

export interface ListRepositoryI {
  getTotalListInList(board_id: string): Promise<ResponseData<number>>
  newTopOrderList(board_id: string): Promise<ResponseData<number>>
  newBottomOrderList(board_id: string): Promise<ResponseData<number>>
  getMaxListOrderInBoard(board_id: string): Promise<number>
  getAdjacentListIds(list_id: string, board_id: string): Promise<ResponseData<{ previous_id: string | null; next_id: string | null }>>

  getList(filter: filterListDetail): Promise<ResponseData<ListDetail>>;
  createList(data: ListDetail): Promise<ResponseData<ListDetail>>;
  deleteList(filter: filterListDetail): Promise<number>;
  updateList(filter: filterListDetail, data: ListDetailUpdate): Promise<number>;
  getListList(filter: filterListDetail, paginate: Paginate): Promise<ResponseListData<Array<ListDetail>>>;
  moveList(filter: filterMoveList): Promise<ResponseData<ListDetail>>;
}

export interface filterListDetail {
  id?: string;
  name?: string;
  background?: string;
  workspace_id?: string;
  board_id?: string;
  card_limit?: number;

  __orId?: string;
  __orName?: string;
  __orWorkspaceId?: string;
  __orBoardId?: string;
  __orCardLimit?: number;

  __notId?: string;
  __notName?: string;
  __notWorkspaceId?: string;
  __notBoardId?: string;
  __notCardLimit?: string;
}

export interface filterMoveList {
  id?: string;
  previous_position?: number;
  target_position?: number;
  board_id?: string;
}

export class ListDetailUpdate {
  public name?: string;
  public background?: string;
  public card_limit?: number;

  constructor(payload: Partial<ListDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.background) data.background = this.background;
    if (this.card_limit) data.card_limit = this.card_limit;
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
  public card_limit!: number;

  constructor(payload: Partial<ListDetail>) {
    Object.assign(this, payload);
  }
}
