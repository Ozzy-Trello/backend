import { ResponseData } from "@/utils/response_utils";

export interface IAdditionalFieldRepository {
  getAdditionalFieldsByCardId(cardId: string): Promise<ResponseData<AdditionalFieldDTO[]>>;
  getAdditionalFieldById(id: string): Promise<ResponseData<AdditionalFieldDTO>>;
  createAdditionalField(data: CreateAdditionalFieldDTO): Promise<ResponseData<AdditionalFieldDTO>>;
  updateAdditionalField(id: string, data: UpdateAdditionalFieldDTO): Promise<ResponseData<AdditionalFieldDTO>>;
  deleteAdditionalField(id: string): Promise<number>;
}

export interface IAdditionalFieldController {
  GetAdditionalFieldsByCardId(cardId: string): Promise<ResponseData<AdditionalFieldDTO[]>>;
  GetAdditionalFieldById(id: string): Promise<ResponseData<AdditionalFieldDTO>>;
  CreateAdditionalField(data: CreateAdditionalFieldDTO): Promise<ResponseData<AdditionalFieldDTO>>;
  UpdateAdditionalField(id: string, data: UpdateAdditionalFieldDTO): Promise<ResponseData<AdditionalFieldDTO>>;
  DeleteAdditionalField(id: string): Promise<ResponseData<null>>;
}

export interface CreateAdditionalFieldDTO {
  card_id: string;
  data: Record<string, any>;
}

export interface UpdateAdditionalFieldDTO {
  data: Record<string, any>;
}

export interface AdditionalFieldDTO {
  id: string;
  card_id: string;
  data: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}
