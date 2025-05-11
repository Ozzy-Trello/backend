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

export interface RequestDTO {
  id: number;
  card_id: string;
  request_type: string;
  requested_item_id: string;
  request_amount: number;
  is_verified: boolean;
  adjustment_no?: string | null;
  description?: string | null;
  item_name?: string | null;
  adjustment_name?: string | null;
  createdAt: Date;
  updatedAt: Date;
  card_name?: string | null;
}

export interface IRequestRepository {
  createRequest(data: CreateRequestDTO): Promise<any>;
  verifyRequest(id: number): Promise<any>;
  unverifyRequest(id: number): Promise<any>;
  getAllRequests(page: number, limit: number): Promise<{ requests: RequestDTO[], total: number }>;
}
