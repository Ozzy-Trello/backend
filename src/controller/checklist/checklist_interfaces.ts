import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";

export interface IChecklistRepository {
  getChecklistsByCardId(cardId: string): Promise<ResponseData<ChecklistDTO[]>>;
  getChecklistById(id: string): Promise<ResponseData<ChecklistDTO>>;
  createChecklist(data: CreateChecklistDTO): Promise<ResponseData<ChecklistDTO>>;
  updateChecklist(id: string, data: UpdateChecklistDTO): Promise<ResponseData<ChecklistDTO>>;
  deleteChecklist(id: string): Promise<number>;
}

export interface IChecklistController {
  GetChecklistsByCardId(cardId: string): Promise<ResponseData<ChecklistDTO[]>>;
  GetChecklistById(id: string): Promise<ResponseData<ChecklistDTO>>;
  CreateChecklist(data: CreateChecklistDTO): Promise<ResponseData<ChecklistDTO>>;
  UpdateChecklist(id: string, data: UpdateChecklistDTO): Promise<ResponseData<ChecklistDTO>>;
  DeleteChecklist(id: string): Promise<ResponseData<null>>;
}

export interface ChecklistItem {
  label: string;
  checked: boolean;
  due_date?: string; // ISO date string format
  assignee_id?: string; // User ID of the assignee
  assignee_name?: string; // Optional name of the assignee for display purposes
}

export interface CreateChecklistDTO {
  card_id: string;
  title: string;
  data: ChecklistItem[];
}

export interface UpdateChecklistDTO {
  title?: string;
  data: ChecklistItem[];
}

export interface ChecklistDTO {
  id: string;
  card_id: string;
  title: string;
  data: ChecklistItem[];
  created_at?: Date;
  updated_at?: Date;
}
