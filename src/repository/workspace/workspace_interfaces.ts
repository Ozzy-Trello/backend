import {ResponseData} from "@/utils/response_utils";

export interface WorkspaceRepositoryI {
  getWorkspace(filter: filterWorkspaceDetail): Promise<ResponseData<WorkspaceDetail>>;
  createWorkspace(data: WorkspaceDetail): Promise<ResponseData<WorkspaceDetail>>;
  deleteWorkspace(filter: filterWorkspaceDetail): Promise<number>;
  updateWorkspace(filter: filterWorkspaceDetail, data: WorkspaceDetailUpdate): Promise<number>;
  getWorkspaceList(filter: filterWorkspaceDetail): Promise<Array<WorkspaceDetail>>;
}

export interface filterWorkspaceDetail {
  id?: string;
  name?: string;
  description?: string;
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
