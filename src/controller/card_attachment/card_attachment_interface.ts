import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";

export interface CardAttachmentControllerI {
  CreateCardAttachment(userId: string, data: CardAttachmentCreateData): Promise<ResponseData<CardAttachmentResponse>>;
  GetCardAttachment(filter: CardAttachmentFilter): Promise<ResponseData<CardAttachmentResponse>>;
  GetCardAttachmentList(filter: CardAttachmentFilter, paginate: Paginate): Promise<ResponseListData<Array<CardAttachmentResponse>>>;
  UpdateCardAttachment(filter: CardAttachmentFilter, data: CardAttachmentUpdateData): Promise<ResponseData<null>>;
  DeleteCardAttachment(filter: CardAttachmentFilter): Promise<ResponseData<null>>;
  GetCoverAttachment(cardId: string): Promise<ResponseData<CardAttachmentResponse>>;
}

export class CardAttachmentResponse {
  id!: string;
  card_id!: string;
  file_id!: string;
  is_cover?: boolean;
  created_by!: string;
  created_at!: Date;
  updated_at!: Date;
  file?: any; // File details object
  
  constructor(payload: Partial<CardAttachmentResponse>) {
    Object.assign(this, payload);
  }
}

export class CardAttachmentFilter {
  id?: string;
  card_id?: string;
  file_id?: string;
  is_cover?: boolean;
  created_by?: string;
  
  constructor(payload: Partial<CardAttachmentFilter>) {
    Object.assign(this, payload);
  }
}

export class CardAttachmentCreateData {
  card_id!: string;
  file_id!: string;
  is_cover!: boolean;
  
  constructor(payload: Partial<CardAttachmentCreateData>) {
    Object.assign(this, payload);
  }
}

export class CardAttachmentUpdateData {
  is_cover?: boolean;
  
  constructor(payload: Partial<CardAttachmentUpdateData>) {
    Object.assign(this, payload);
  }
}