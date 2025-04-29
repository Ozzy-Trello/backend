import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";

export interface FileControllerI {
  UploadFile(userId: string, data: FileCreateData): Promise<ResponseData<FileResponse>>;
  GetFile(filter: FileFilter): Promise<ResponseData<FileResponse>>;
  GetFileList(filter: FileFilter, paginate: Paginate): Promise<ResponseListData<Array<FileResponse>>>;
  DeleteFile(filter: FileFilter): Promise<ResponseData<null>>;
}

export class FileResponse {
  id!: string;
  name!: string;
  url!: string;
  size!: number;
  size_unit!: string;
  mime_type!: string;
  created_at!: Date;
  created_by!: string;
  card_id?: string;
  
  constructor(payload: Partial<FileResponse>) {
    Object.assign(this, payload);
  }
}

export class FileFilter {
  id?: string;
  name?: string;
  created_by?: string;
  card_id?: string;
  mime_type?: string;
  
  constructor(payload: Partial<FileFilter>) {
    Object.assign(this, payload);
    this.isEmpty = this.isEmpty.bind(this);
    this.getErrorField = this.getErrorField.bind(this);
  }
  
  getErrorField(): string | null {
    if(this.id && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(this.id)) {
      return "id is not valid uuid";
    }
    return null;
  }
  
  isEmpty(): boolean {
    return this.id === undefined && this.name === undefined && 
           this.created_by === undefined && this.card_id === undefined &&
           this.mime_type === undefined;
  }
}

export class FileCreateData {
  file!: Express.Multer.File;
  name!: string;
  prefix?: string;
  card_id?: string;
  
  constructor(payload: Partial<FileCreateData>) {
    Object.assign(this, payload);
    this.isEmpty = this.isEmpty.bind(this);
    this.checkRequired = this.checkRequired.bind(this);
  }

  checkRequired(): string | null {
    if (!this.file) return 'file';
    if (!this.name) return 'name';
    return null;
  }
  
  isEmpty(): boolean {
    return !this.file || !this.name;
  }
}