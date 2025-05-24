import { Paginate } from '@/utils/data_utils';
import { ResponseData, ResponseListData } from '@/utils/response_utils';
import { LabelAttributes } from '@/database/schemas/label';

export interface filterLabelDetail {
  id?: string;
  name?: string;
  value?: string;
  workspace_id?: string;
  value_type?: 'color' | 'user' | 'custom_field';
  __orId?: string;
  __orName?: string;
  __orValue?: string;
  __orValueType?: 'color' | 'user' | 'custom_field';
  __notId?: string;
  __notName?: string;
  __notValue?: string;
  __notValueType?: 'color' | 'user' | 'custom_field';
}

export interface LabelRepositoryI {
  createLabel(data: Omit<LabelAttributes, 'id' | 'created_at' | 'updated_at'>): Promise<ResponseData<LabelAttributes>>;
  getLabel(filter: filterLabelDetail): Promise<ResponseData<LabelAttributes>>;
  getLabels(filter: filterLabelDetail, paginate: Paginate): Promise<ResponseListData<LabelAttributes[]>>;
  updateLabel(id: string, data: Partial<LabelAttributes>): Promise<ResponseData<LabelAttributes>>;
  deleteLabel(id: string): Promise<ResponseData<null>>;
}