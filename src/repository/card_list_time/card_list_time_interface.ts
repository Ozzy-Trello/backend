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
  public total_seconds?: number;
  public formatted_time_in_list?: string;
  public list_name?: string;
  
  constructor(payload: Partial<CardListTimeDetail>) {
    Object.assign(this, payload);
  }
}
