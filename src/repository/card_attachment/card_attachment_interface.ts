import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";

export interface CardAttachmentRepositoryI {
  getCardAttachment(filter: filterCardAttachmentDetail): Promise<ResponseData<CardAttachmentDetail>>;
  createCardAttachment(data: CardAttachmentDetail): Promise<ResponseData<CardAttachmentDetail>>;
  deleteCardAttachment(filter: filterCardAttachmentDetail): Promise<number>;
  getCardAttachmentList(filter: filterCardAttachmentDetail, paginate: Paginate): Promise<ResponseListData<Array<CardAttachmentDetail>>>;
  updateCardAttachment(filter: filterCardAttachmentDetail, data: CardAttachmentDetailUpdate): Promise<number>;
  getCoverAttachment(cardId: string): Promise<ResponseData<CardAttachmentDetail>>;
}

export interface filterCardAttachmentDetail {
  id?: string;
  card_id?: string;
  file_id?: string;
  is_cover?: boolean;
  created_by?: string;
}

export class CardAttachmentDetail {
  public id?: string;
  public card_id!: string;
  public file_id!: string;
  public is_cover!: boolean;
  public created_by?: string;
  public created_at?: Date;
  public updated_at?: Date;
  public file?: any
  
  constructor(payload: Partial<CardAttachmentDetail>) {
    Object.assign(this, payload);
  }
}

export class CardAttachmentDetailUpdate {
  public card_id?: string;
  public file_id?: string;
  public is_cover?: string;
  
  constructor(payload: Partial<CardAttachmentDetailUpdate>) {
    Object.assign(this, payload);
    this.isEmpty = this.isEmpty.bind(this);
  }
  
  public toObject(): any {
    const data: any = {};
    if (this.card_id) data.card_id = this.card_id;
    if (this.file_id) data.file_id = this.file_id;
    if (this.is_cover) data.is_cover = this.is_cover;
    return data;
  }
  
  isEmpty(): boolean {
    return this.card_id === undefined && this.file_id === undefined;
  }
}