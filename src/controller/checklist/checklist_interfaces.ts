import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import { EventPublisher } from "@/event_publisher";

export interface IChecklistRepository {
  getChecklistsByCardId(cardId: string): Promise<ResponseData<ChecklistDTO[]>>;
  getChecklistById(id: string): Promise<ResponseData<ChecklistDTO>>;
  createChecklist(
    data: CreateChecklistDTO
  ): Promise<ResponseData<ChecklistDTO>>;
  updateChecklist(
    id: string,
    data: UpdateChecklistDTO
  ): Promise<ResponseData<ChecklistDTO>>;
  deleteChecklist(id: string): Promise<number>;
  createBulkChecklist(
    data: CreateChecklistDTO[]
  ): Promise<ResponseData<ChecklistDTO[]>>;
}

export interface IChecklistController {
  SetEventPublisher(event_publisher: EventPublisher): void
  GetChecklistsByCardId(cardId: string): Promise<ResponseData<ChecklistDTO[]>>;
  GetChecklistById(id: string): Promise<ResponseData<ChecklistDTO>>;
  CreateChecklist(
    user_id: string,
    data: CreateChecklistDTO,
    isAutomatedAction?: boolean
  ): Promise<ResponseData<ChecklistDTO>>;
  UpdateChecklist(
    user_id: string,
    id: string,
    data: UpdateChecklistDTO
  ): Promise<ResponseData<ChecklistDTO>>;
  DeleteChecklist(user_id: string, id: string): Promise<ResponseData<null>>;
  CreateBulkChecklist(
    data: CreateChecklistDTO[]
  ): Promise<ResponseData<ChecklistDTO[]>>;
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
  created_by?: string;
  updated_by?: string; // optional, usually not set on create
}

export interface UpdateChecklistDTO {
  title?: string;
  data: ChecklistItem[];
  updated_by?: string;
}

export interface ChecklistDTO {
  id: string;
  card_id: string;
  title: string;
  data: ChecklistItem[];
  created_at?: Date;
  updated_at?: Date;
}
