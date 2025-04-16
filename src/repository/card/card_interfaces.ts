import { validate as isValidUUID } from 'uuid';

import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import { CardActionType, CardActionValue, CardActivityType, MoveListValue } from "@/types/custom_field";

export interface CardRepositoryI {
  getCard(filter: filterCardDetail): Promise<ResponseData<CardDetail>>;
  createCard(data: CardDetail): Promise<ResponseData<CardDetail>>;
  deleteCard(filter: filterCardDetail): Promise<number>;
  updateCard(filter: filterCardDetail, data: CardDetailUpdate): Promise<number>;
  getListCard(filter: filterCardDetail, paginate: Paginate): Promise<ResponseListData<Array<CardDetail>>>;

  addActivity(filter: filterCardDetail, data: CardActivity): Promise<ResponseData<CardActivity>>;
  getCardActivities(card_id: string, paginate: Paginate): Promise<ResponseListData<CardActivity[]>>;
  getCardMoveListActivity(card_id: string, paginate: Paginate): Promise<ResponseListData<Array<CardActivityMoveList>>>;
}

export class CardActivity {
  id!: string;
  sender_id!: string;
  card_id!: string;
  activity_type!: CardActivityType;
  // data? : CardActionActivity | Comment 
  action?: CardActionActivity;
  comment?: CardComment;

  constructor(payload: Partial<CardActivity>, data: CardActionActivity | CardComment) {
    Object.assign(this, payload);
    if ('action_type' in data) {
      this.action = data
    }else if('text' in data){
      this.comment = data
    }
    // delete this.data
  }
  
}

export class CardComment {
  text!: string;

  constructor(payload: Partial<CardComment>){
    Object.assign(this, payload);
  }

  checkRequired(): string | null{
		if (this.text == undefined ) return 'text'
		return null
	}
}

export class CardActionActivity {
  action_type!: CardActionType;
  source?: CardActionValue;

  constructor(payload: Partial<CardActionActivity>){
    Object.assign(this, payload);
    this.setMoveListValue = this.setMoveListValue.bind(this);
  }

  setMoveListValue(data: MoveListValue){
    if (this.action_type != CardActionType.MoveList) {
      throw Error("not activity action is not move list")
    }
    this.source = {
      origin_list_id: data.origin_list_id,
      destination_list_id: data.destination_list_id
    }
  }

  // fromStringJson(data: string) {
  //   try {
  //     if (!data) return;
  
  //     const parsed = JSON.parse(data);
  //     switch (this.action_type) {
  //       case CardActionType.MoveList:
  //         if (parsed.origin_list_id && parsed.destination_list_id) {
  //           this.source = {
  //             origin_list_id: parsed.origin_list_id,
  //             destination_list_id: parsed.destination_list_id
  //           };
  //         }
  //         break;
  
  //       case CardActionType.MakeLabel:
  //       case CardActionType.AddTag:
  //       case CardActionType.RemoveTag:
  //         this.source = parsed;
  //         break;
  
  //       default:
  //         this.source = undefined;
  //     }
  
  //   } catch (e) {
  //     console.error('Failed to parse action value:', e);
  //     this.source = undefined;
  //   }
  // }
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
  public list_id?: string;

  constructor(payload: Partial<CardDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    if (this.order) data.order = this.order;
    if (this.list_id) data.list_id = this.list_id;
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


export interface CardActivityMoveList {
  date: string;
  list_id: string
}

