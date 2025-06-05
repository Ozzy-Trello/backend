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
  request_sent: number;
  request_received: number;
  card_name?: string;
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
