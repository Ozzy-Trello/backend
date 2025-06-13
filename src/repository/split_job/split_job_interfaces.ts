import { ResponseData } from "@/utils/response_utils";

export interface SplitJobTemplateDetail {
  id?: string;
  name: string;
  workspace_id: string;
  custom_field_id: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface SplitJobValueDetail {
  id?: string;
  name: string;
  split_job_template_id: string;
  card_id: string;
  custom_field_id: string;
  value: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface filterSplitJobTemplateDetail {
  id?: string;
  workspace_id?: string;
  custom_field_id?: string;
}

export interface filterSplitJobValueDetail {
  id?: string;
  split_job_template_id?: string;
  card_id?: string;
  custom_field_id?: string;
}

export interface ISplitJobRepository {
  // Split Job Template methods
  createSplitJobTemplate(data: SplitJobTemplateDetail): Promise<ResponseData<SplitJobTemplateDetail>>;
  getSplitJobTemplate(filter: filterSplitJobTemplateDetail): Promise<ResponseData<SplitJobTemplateDetail>>;
  getSplitJobTemplates(filter: filterSplitJobTemplateDetail): Promise<ResponseData<SplitJobTemplateDetail[]>>;
  updateSplitJobTemplate(id: string, data: Partial<SplitJobTemplateDetail>): Promise<ResponseData<SplitJobTemplateDetail>>;
  deleteSplitJobTemplate(id: string): Promise<ResponseData<boolean>>;
  
  // Split Job Value methods
  createSplitJobValue(data: SplitJobValueDetail): Promise<ResponseData<SplitJobValueDetail>>;
  getSplitJobValue(filter: filterSplitJobValueDetail): Promise<ResponseData<SplitJobValueDetail>>;
  getSplitJobValues(filter: filterSplitJobValueDetail): Promise<ResponseData<SplitJobValueDetail[]>>;
  updateSplitJobValue(id: string, data: Partial<SplitJobValueDetail>): Promise<ResponseData<SplitJobValueDetail>>;
  deleteSplitJobValue(id: string): Promise<ResponseData<boolean>>;
  deleteSplitJobValuesByTemplate(templateId: string): Promise<ResponseData<boolean>>;
}
