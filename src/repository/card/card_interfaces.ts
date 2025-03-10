import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";

export interface CardRepositoryI {
  getCard(filter: filterCardDetail): Promise<ResponseData<CardDetail>>;
  createCard(data: CardDetail): Promise<ResponseData<CardDetail>>;
  deleteCard(filter: filterCardDetail): Promise<number>;
  updateCard(filter: filterCardDetail, data: CardDetailUpdate): Promise<number>;
  getListCard(filter: filterCardDetail, paginate: Paginate): Promise<ResponseListData<Array<CardDetail>>>;
}

export interface filterCardDetail {
  id?: string;
  name?: string;
  description?: string;
  list_id?: string;

  __orId?: string;
  __orName?: string;
  __orDescription?: string;
  __orListId?: string;

  __notId?: string;
  __notName?: string;
  __notDescription?: string;
  __notListId?: string;
}

export class CardDetailUpdate {
  public name?: string;
  public description?: string;
  public order?: number;

  constructor(payload: Partial<CardDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    if (this.order) data.order = this.order;
    return data
  }
}

export class CardDetail {
  public id!: string;
  public name?: string;
  public description!: string;
  public list_id!: string;
  public order?: number;

  constructor(payload: Partial<CardDetail>) {
    Object.assign(this, payload);
  }
}
