import { ResponseData, ResponseListData } from '@/utils/response_utils';
import { Paginate } from '@/utils/data_utils';
import { LabelAttributes } from '@/database/schemas/label';
import { filterLabelDetail } from '@/repository/label/label_interfaces';

export interface LabelControllerI {
  CreateLabel(data: Omit<LabelAttributes, 'id' | 'created_at' | 'updated_at'>): Promise<ResponseData<LabelAttributes>>;
  GetLabel(filter: filterLabelDetail): Promise<ResponseData<LabelAttributes>>;
  GetLabelList(filter: filterLabelDetail, paginate: Paginate): Promise<ResponseListData<LabelAttributes[]>>;
  UpdateLabel(filter: filterLabelDetail, data: Partial<LabelAttributes>): Promise<ResponseData<LabelAttributes>>;
  DeleteLabel(filter: filterLabelDetail): Promise<ResponseData<null>>;
}
