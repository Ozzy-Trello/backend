export interface CreateRequestDTO {
  card_id: string;
  request_type: string;
  requested_item_id: string;
  request_amount: number;
  adjustment_no?: string;
  description?: string;
  item_name?: string;
  adjustment_name?: string;
  production_recieved?: boolean;
  warehouse_returned?: boolean;
  warehouse_final_used_amount?: number;
  authorized_by?: string;
  warehouse_user?: string;
  production_user?: string;
  is_rejected?: boolean;
  is_done?: boolean;
  satuan?: string;
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
  request_sent?: number | null;
  request_received?: number | null;
  production_recieved: boolean;
  warehouse_returned: boolean;
  warehouse_final_used_amount?: number | null;
  authorized_by: string | null;
  warehouse_user: string | null;
  production_user: string | null;
  production_user_name: string | null;
  warehouse_user_name: string | null;
  authorized_by_name: string | null;
  is_rejected: boolean;
  is_done: boolean;
  satuan?: string | null;
}

export interface IRequestRepository {
  getRequestsByCardId(cardId: string): Promise<RequestDTO[]>;

  createRequest(data: CreateRequestDTO): Promise<any>;
  verifyRequest(id: number): Promise<any>;
  unverifyRequest(id: number): Promise<any>;
  getAllRequests(
    page: number,
    limit: number,
    filter?: any
  ): Promise<{ requests: RequestDTO[]; total: number }>;
  patchRequest(id: number, patch: Partial<RequestDTO>): Promise<any>;
}
