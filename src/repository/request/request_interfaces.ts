export interface RequestDTO {
  id: number;
  card_id: string;
  request_type: string;
  requested_item_id: string;
  request_amount: number;
  is_verified: boolean;
  adjustment_no?: string;
  description?: string;
  item_name?: string;
  adjustment_name?: string;
  createdAt: Date;
  updatedAt: Date;
  card_name?: string;
}

export interface IRequestRepository {
  create(createRequestDTO: CreateRequestDTO): Promise<RequestDTO>;
  getRequestsByCardId(cardId: string): Promise<RequestDTO[]>;
}

export interface CreateRequestDTO {
  card_id: string;
  request_type: string;
  requested_item_id: string;
  request_amount: number;
  adjustment_no?: string;
  description?: string;
  item_name?: string;
  adjustment_name?: string;
}
