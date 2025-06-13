import { validate as isValidUUID } from "uuid";

import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import {
  CardActionValue,
  CardActivityType,
  MoveListValue,
} from "@/types/custom_field";
import { date } from "zod";
import {
  DashCardConfig,
  FilterConfig,
} from "@/controller/card/card_interfaces";

export interface CardRepositoryI {
  getCard(filter: filterCardDetail): Promise<ResponseData<CardDetail>>;
  createCard(data: CardDetail): Promise<ResponseData<CardDetail>>;
  deleteCard(filter: filterCardDetail): Promise<number>;
  updateCard(filter: filterCardDetail, data: CardDetailUpdate): Promise<number>;
  getListCard(
    filter: filterCardDetail,
    paginate: Paginate
  ): Promise<ResponseListData<Array<CardDetail>>>;
  moveCard(filter: filterMoveCard): Promise<ResponseData<CardDetail>>;
  getMaxCardOrderInList(list_id: string): Promise<number>;

  getTotalCardInList(list_id: string): Promise<ResponseData<number>>;

  addActivity(
    filter: filterCardDetail,
    data: CardActivity
  ): Promise<ResponseData<CardActivity>>;
  getCardActivities(
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseListData<CardActivity[]>>;
  getCardMoveListActivity(
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseListData<Array<CardActivityMoveList>>>;

  newTopOrderCard(list_id: string): Promise<ResponseData<number>>;
  newBottomOrderCard(list_id: string): Promise<ResponseData<number>>;
  countAllCards(): Promise<number>;
  countCardsWithFilters(filters: FilterConfig[]): Promise<number>;
  copyCardWithMirror(
    card_id: string,
    target_list_id: string
  ): Promise<ResponseData<CardDetail>>;
}

export class CardActivity {
  id!: string;
  sender_id!: string;
  card_id!: string;
  activity_type!: CardActivityType;
  data?: CardActionActivity | Comment;
  action?: CardActionActivity;
  comment?: CardComment;

  constructor(
    payload: Partial<CardActivity>,
    data: CardActionActivity | CardComment
  ) {
    Object.assign(this, payload);
    // if ('action_type' in data) {
    //   this.action = data
    // }else if('text' in data){
    //   this.comment = data
    // }
    // delete this.data
  }
}

export class CardComment {
  text!: string;

  constructor(payload: Partial<CardComment>) {
    Object.assign(this, payload);
  }

  checkRequired(): string | null {
    if (this.text == undefined) return "text";
    return null;
  }
}

export class CardActionActivity {
  // action_type!: CardActionType;
  source?: CardActionValue;

  constructor(payload: Partial<CardActionActivity>) {
    Object.assign(this, payload);
    this.setMoveListValue = this.setMoveListValue.bind(this);
  }

  setMoveListValue(data: MoveListValue) {
    // if (this.action_type != CardActionType.MoveList) {
    //   throw Error("not activity action is not move list")
    // }
    this.source = {
      origin_list_id: data.origin_list_id,
      destination_list_id: data.destination_list_id,
    };
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
  location?: string;
  board_id?: string;
  archive?: boolean;
  is_complete?: boolean; // Added

  __orId?: string;
  __orName?: string;
  __orDescription?: string;
  __orListId?: string;
  __orArchive?: boolean;

  __notId?: string;
  __notName?: string;
  __notDescription?: string;
  __notListId?: string;
  __notArchive?: boolean;
}

export interface filterMoveCard {
  id?: string;
  previous_list_id?: string;
  target_list_id?: string;
  previous_position?: number;
  target_position?: number;
  target_position_top_or_bottom?: string;
}

export class CardDetailUpdate {
  public name?: string;
  public description?: string;
  public order?: number;
  public list_id?: string;
  public location?: string;
  public start_date?: Date;
  public due_date?: Date;
  public due_date_reminder?: string;
  public dash_config?: JSON;
  public archive?: boolean;
  public is_complete?: boolean; // Added
  public completed_at?: Date; // Added

  constructor(payload: Partial<CardDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    if (this.order) data.order = this.order;
    if (this.list_id) data.list_id = this.list_id;
    if (this.location) data.location = this.location;
    if (this.start_date) data.start_date = this.start_date;
    if (this.due_date) data.due_date = this.due_date;
    if (this.due_date_reminder) data.due_date_reminder = this.due_date_reminder;
    if (this.dash_config) data.dash_config = this.dash_config;
    if (this.archive) data.archive = this.archive;
    if (this.is_complete) data.is_complete = this.is_complete;
    if (this.completed_at) data.completed_at = this.completed_at;
    return data;
  }
}

export class CardDetail {
  public id!: string;
  public name?: string;
  public description!: string;
  public list_id!: string;
  public type!: string;
  public order?: number;
  public location?: string;
  public cover?: string;
  public start_date?: Date;
  public due_date?: Date;
  public due_date_reminder?: string;
  public dash_config?: any;
  public created_at?: Date;
  public updated_at?: Date;
  public formatted_time_in_list?: string;
  public formatted_time_in_board?: string;
  public archive?: boolean;
  public is_complete?: boolean; // Added
  public completed_at?: Date; // Added
  public mirror_id?: string | null;
  public is_mirror: boolean = false;
  public item_dashcard?: IItemDashcard[] | null;

  constructor(payload: Partial<CardDetail>) {
    Object.assign(this, payload);
    this.is_mirror = !!payload.mirror_id;
  }

  getDashConfig(): DashCardConfig | null {
    if (!this.dash_config) return null;

    try {
      if (typeof this.dash_config === "string") {
        return DashCardConfig.fromJSON(this.dash_config);
      } else {
        return new DashCardConfig(this.dash_config);
      }
    } catch (e) {
      console.error("Error parsing dash_config:", e);
      return null;
    }
  }
}

export interface CardActivityMoveList {
  date: string;
  list_id: string;
}

export interface filterCount {
  _starts_with_board?: string;
  _matches_board?: string;
  _starts_with_list?: string;
  _matches_list?: string;
}

export type TDynamicColumnDashcard = {
  type: string;
  column: string;
  value: string;
};

export type TMemberDashcard = {
  id: string;
  name: string;
};

export interface IItemDashcard {
  id: string;
  name: string;
  member: TMemberDashcard[];
  description: string;
  columns: TDynamicColumnDashcard[];
}

export class CardResponse {
  id!: string;
  name?: string;
  description?: string;
  location?: string;
  order?: number;
  list_id?: string;
  type?: string;
  cover?: string;
  created_at?: Date;
  updated_at?: Date;
  dash_config?: DashCardConfig;
  formatted_time_in_list?: string;
  formatted_time_in_board?: string;
  is_complete?: boolean; // Added
  completed_at?: Date; // Added
  is_mirror: boolean = false;
  mirror_id?: string | null;
  constructor(payload: Partial<CardResponse>) {
    Object.assign(this, payload);
    this.is_mirror = !!payload.mirror_id;
  }
}

export function fromCardDetailToCardResponse(data: CardDetail): CardResponse {
  return new CardResponse({
    id: data.id,
    name: data.name!,
    type: data.type,
    description: data.description,
    location: data?.location,
    order: data.order,
    list_id: data.list_id,
    dash_config: data.dash_config,
    cover: data.cover,
    created_at: data.created_at,
    updated_at: data.updated_at,
    formatted_time_in_list: data.formatted_time_in_list,
    formatted_time_in_board: data.formatted_time_in_board,
    is_mirror: data.is_mirror,
    mirror_id: data.mirror_id,
  });
}
