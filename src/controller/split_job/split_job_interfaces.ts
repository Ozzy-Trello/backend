import { Request } from "express";
import { ResponseData } from "@/utils/response_utils";
import { SplitJobTemplateDetail, SplitJobValueDetail } from "@/repository/split_job/split_job_interfaces";

// Define the structure for grouped split job values
export interface GroupedSplitJobValues {
  [customFieldName: string]: SplitJobValueDetail[];
}

export interface ISplitJobController {
  // Split Job Template methods
  CreateSplitJobTemplate(req: Request): Promise<ResponseData<SplitJobTemplateDetail>>;
  GetSplitJobTemplate(req: Request): Promise<ResponseData<SplitJobTemplateDetail>>;
  GetSplitJobTemplates(req: Request): Promise<ResponseData<SplitJobTemplateDetail[]>>;
  UpdateSplitJobTemplate(req: Request): Promise<ResponseData<SplitJobTemplateDetail>>;
  DeleteSplitJobTemplate(req: Request): Promise<ResponseData<boolean>>;
  
  // Split Job Value methods
  CreateSplitJobValue(req: Request): Promise<ResponseData<SplitJobValueDetail>>;
  GetSplitJobValue(req: Request): Promise<ResponseData<SplitJobValueDetail>>;
  GetSplitJobValues(req: Request): Promise<ResponseData<SplitJobValueDetail[]>>;
  GetSplitJobValuesByCustomField(req: Request): Promise<ResponseData<GroupedSplitJobValues>>;
  UpdateSplitJobValue(req: Request): Promise<ResponseData<SplitJobValueDetail>>;
  DeleteSplitJobValue(req: Request): Promise<ResponseData<boolean>>;
}
