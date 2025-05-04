import { Paginate } from '@/utils/data_utils';
import { ResponseData, ResponseListData } from '@/utils/response_utils';

export interface FileRepositoryI {
  getFile(filter: filterFileDetail): Promise<ResponseData<FileDetail>>;
  createFile(data: FileDetail): Promise<ResponseData<FileDetail>>;
  deleteFile(filter: filterFileDetail): Promise<number>;
  updateFile(filter: filterFileDetail, data: FileDetailUpdate): Promise<number>;
  getFileList(filter: filterFileDetail, paginate: Paginate): Promise<ResponseListData<Array<FileDetail>>>;
}

export interface filterFileDetail {
  id?: string;
  name?: string;
  created_by?: string;
  mime_type?: string;
}

export class FileDetailUpdate {
  public name?: string;
  public url?: string;
  public size?: number;
  public size_unit?: string;
  public mime_type?: string;
  
  constructor(payload: Partial<FileDetailUpdate>) {
    Object.assign(this, payload);
  }
  
  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.url) data.url = this.url;
    if (this.size) data.size = this.size;
    if (this.size_unit) data.size_unit = this.size_unit;
    if (this.mime_type) data.mime_type = this.mime_type;
    return data;
  }
}

export class FileDetail {
  public id?: string;
  public name!: string;
  public url!: string;
  public size!: number;
  public size_unit!: string;
  public mime_type!: string;
  public created_by?: string;
  public card_id?: string;
  public created_at?: Date;
  public updated_at?: Date;
  
  constructor(payload: Partial<FileDetail>) {
    Object.assign(this, payload);
  }
}