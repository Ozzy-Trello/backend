import {ResponseData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";

export interface ListRepositoryI {
  getList(filter: filterListDetail): Promise<ResponseData<ListDetail>>;
  createList(data: ListDetail): Promise<ResponseData<ListDetail>>;
  deleteList(filter: filterListDetail): Promise<number>;
  updateList(filter: filterListDetail, data: ListDetailUpdate): Promise<number>;
  getListList(filter: filterListDetail, paginate: Paginate): Promise<Array<ListDetail>>;
}

export interface filterListDetail {
  id?: string;
  board_id?: string;
  order?: number;
  name?: string;
  background?: string;
}

export class ListDetailUpdate {
  public board_id?: string;
  public order?: number;
  public name?: string;
  public background?: string;

  constructor(payload: Partial<ListDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.board_id) data.board_id = this.board_id;
    if (this.order) data.order = this.order;
    if (this.name) data.name = this.name;
    if (this.background) data.background = this.background;
    return data
  }
}

export class ListDetail {
  public id?: string;
  public board_id?: string;
  public order?: number;
  public name?: string;
  public background?: string;

  constructor(payload: Partial<ListDetail>) {
    Object.assign(this, payload);
  }
}
