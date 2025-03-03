import {ResponseData} from "@/utils/response_utils";

export interface CardRepositoryI {
  getCard(filter: filterCardDetail): Promise<ResponseData<CardDetail>>;
  createCard(data: CardDetail): Promise<ResponseData<CardDetail>>;
  deleteCard(filter: filterCardDetail): Promise<number>;
  updateCard(filter: filterCardDetail, data: CardDetailUpdate): Promise<number>;
  getCardList(filter: filterCardDetail): Promise<Array<CardDetail>>;
}

export interface filterCardDetail {
  id?: string;
  list_id?: string;
  name?: string;
  description?: string;
}

export class CardDetailUpdate {
  public list_id?: string;
  public name?: string;
  public description?: string;

  constructor(payload: Partial<CardDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.list_id) data.list_id = this.list_id;
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    return data
  }
}

export class CardDetail {
  public id?: string;
  public list_id?: string;
  public name?: string;
  public description?: string;

  constructor(payload: Partial<CardDetail>) {
    Object.assign(this, payload);
  }
}
