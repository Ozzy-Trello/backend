import { ResponseData } from "@/utils/response_utils";
import { AttachmentType } from "@/types/card_attachment";

export interface CardListTimeRepositoryI {
  createCardTimeInList(data: CardListTimeDetail): Promise<ResponseData<CardListTimeDetail>>;
  updateTimeTrackingRecord(data: filterCardListTimeDetail): Promise<ResponseData<CardListTimeDetail>>;
  getCardTimeInList(cardId: string): Promise<ResponseData<Array<CardListTimeDetail>>>;
}

export interface filterCardListTimeDetail {
  id?: string;
  card_id?: string;
  list_id?: string;
  entered_at?: Date;
  exited_at?: Date;
  formatted_time_in_list?: string;
  list_name?: string;
}

export class CardListTimeDetail {
  public id?: string;
  public card_id!: string;
  public list_id!: string;
  public entered_at!: Date;
  public exited_at!: Date;
  public formatted_time_in_list?: string;
  public list_name?: string;
  
  constructor(payload: Partial<CardListTimeDetail>) {
    Object.assign(this, payload);
  }
}

export class CardAttachmentDetailUpdate {
  public card_id?: string;
  public attachable_type?: AttachmentType;
  public attachable_id?: string;
  public is_cover?: string;
  
  constructor(payload: Partial<CardAttachmentDetailUpdate>) {
    Object.assign(this, payload);
    this.isEmpty = this.isEmpty.bind(this);
  }
  
  public toObject(): any {
    const data: any = {};
    if (this.card_id) data.card_id = this.card_id;
    if (this.attachable_type) data.attachable_type = this.attachable_type;
    if (this.attachable_id) data.attachable_id = this.attachable_id;
    if (this.is_cover) data.is_cover = this.is_cover;
    return data;
  }
  
  isEmpty(): boolean {
    return this.card_id === undefined;
  }
}