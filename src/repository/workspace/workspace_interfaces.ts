import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";

export interface WorkspaceRepositoryI {
  getWorkspace(filter: filterWorkspaceDetail): Promise<ResponseData<WorkspaceDetail>>;
  addMember(id: string, user_id: string, role_id: string): Promise<number>;
  removeMember(id: string, user_id: string): Promise<number>
  isMember(id: string, user_id: string): Promise<number>
  createWorkspace(data: WorkspaceDetail): Promise<ResponseData<WorkspaceDetail>>;
  deleteWorkspace(filter: filterWorkspaceDetail): Promise<number>;
  updateWorkspace(filter: filterWorkspaceDetail, data: WorkspaceDetailUpdate): Promise<number>;
  getWorkspaceList(filter: filterWorkspaceDetail, paginate: Paginate): Promise<ResponseListData<Array<WorkspaceDetail>>>;
}

export class filterWorkspaceDetail {
  id?: string;
  name?: string;
  description?: string;
  user_id_owner?: string;

  __orId?: string;
  __orName?: string;
  __orDescription?: string;

  __notId?: string;
  __notName?: string;
  __notDescription?: string;

  constructor(payload: Partial<filterWorkspaceDetail>){
    Object.assign(this, payload)
    this.isEmpty = this.isEmpty.bind(this)
  }

  isEmpty(): boolean {
    return this.id == undefined &&
    this.name == undefined &&
    this.description == undefined &&
    this.user_id_owner == undefined &&
    this.__orId == undefined &&
    this.__orName == undefined &&
    this.__orDescription == undefined &&
    this.__notId == undefined &&
    this.__notName == undefined &&
    this.__notDescription == undefined
  }

}

export class WorkspaceDetailUpdate {
  public name?: string;
  public description?: string;

  constructor(payload: Partial<WorkspaceDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    return data
  }
}

export class WorkspaceDetail {
  public id?: string;
  public name?: string;
  public description?: string;

  constructor(payload: Partial<WorkspaceDetail>) {
    Object.assign(this, payload);
  }
}
