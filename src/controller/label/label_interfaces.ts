import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import { LabelAttributes } from "@/database/schemas/label";
import {
  CardLabelDetail,
  CreateCardLabelData,
  filterLabelDetail,
} from "@/repository/label/label_interfaces";

export interface LabelControllerI {
  CreateLabel(
    data: Omit<LabelAttributes, "id" | "created_at" | "updated_at">
  ): Promise<ResponseData<LabelAttributes>>;
  GetLabel(filter: filterLabelDetail): Promise<ResponseData<LabelAttributes>>;
  // GetLabelList(filter: filterLabelDetail, paginate: Paginate): Promise<ResponseListData<LabelAttributes[]>>;
  UpdateLabel(
    filter: filterLabelDetail,
    data: Partial<LabelAttributes>
  ): Promise<ResponseData<LabelAttributes>>;
  DeleteLabel(filter: filterLabelDetail): Promise<ResponseData<null>>;
  AddLabelToCard(
    data: CreateCardLabelData
  ): Promise<ResponseData<CardLabelDetail>>;
  RemoveLabelFromCard(
    label_id: string,
    card_id: string
  ): Promise<ResponseData<null>>;
  GetLabels(
    workspace_id: string,
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseData<CardLabelDetail[]>>;
  GetAssignedLabelInCard(
    workspace_id: string,
    card_id: string
  ): Promise<ResponseData<CardLabelDetail[]>>;
  GetAllLabels(workspace_id: string): Promise<ResponseData<LabelAttributes[]>>;
}
