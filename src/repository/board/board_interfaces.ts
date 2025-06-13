import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import { BoardVisibility } from "@/database/schemas/board";

export interface BoardRepositoryI {
  getBoard(filter: filterBoardDetail, userRoles?: string[]): Promise<ResponseData<BoardDetail>>;
  addMember(id: string, user_id: string, role_id: string): Promise<number>;
  removeMember(id: string, user_id: string): Promise<number>;
  isMember(id: string, user_id: string): Promise<boolean>;
  createBoard(data: BoardDetail & { roleIds?: string[] }): Promise<ResponseData<BoardDetail>>;
  deleteBoard(filter: filterBoardDetail): Promise<number>;
  updateBoard(
    filter: filterBoardDetail, 
    data: BoardDetailUpdate & { roleIds?: string[] },
    userRoles?: string[]
  ): Promise<number>;
  getBoardList(
    filter: filterBoardDetail, 
    paginate: Paginate,
    userRoles?: string[]
  ): Promise<ResponseListData<BoardDetail[]>>;
}

export interface filterBoardDetail {
  id?: string;
  name?: string;
  description?: string;
  background?: string;
  workspace_id?: string;

  __orId?: string;
  __orName?: string;
  __orDescription?: string;
  __orWorkspaceId?: string;

  __notId?: string;
  __notName?: string;
  __notDescription?: string;
  __notWorkspaceId?: string;
}

export interface BoardRole {
  id: string;
  name: string;
}

export interface IBoardDetail {
  id?: string;
  name: string;
  description: string;
  background: string;
  workspace_id: string;
  visibility?: BoardVisibility;
  roles?: BoardRole[];
  created_at?: Date;
  updated_at?: Date;
}

export class BoardDetailImpl implements IBoardDetail {
  id?: string;
  name: string;
  description: string;
  background: string;
  workspace_id: string;
  visibility?: BoardVisibility;
  roles?: BoardRole[];
  created_at?: Date;
  updated_at?: Date;

  constructor(payload: Partial<IBoardDetail> = {}) {
    this.name = payload.name || '';
    this.description = payload.description || '';
    this.background = payload.background || '';
    this.workspace_id = payload.workspace_id || '';
    
    if (payload.visibility) this.visibility = payload.visibility;
    if (payload.roles) this.roles = payload.roles;
    if (payload.id) this.id = payload.id;
    if (payload.created_at) this.created_at = payload.created_at;
    if (payload.updated_at) this.updated_at = payload.updated_at;
  }

  public toObject(): any {
    const data: any = {
      name: this.name,
      description: this.description,
      background: this.background,
      workspace_id: this.workspace_id,
    };
    
    if (this.visibility) data.visibility = this.visibility;
    if (this.roles) data.roles = this.roles;
    
    return data;
  }
}

export class BoardDetailUpdate {
  public name?: string;
  public description?: string;
  public background?: string;
  public visibility?: BoardVisibility;
  public roleIds?: string[];

  constructor(payload: Partial<BoardDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.name !== undefined) data.name = this.name;
    if (this.description !== undefined) data.description = this.description;
    if (this.background !== undefined) data.background = this.background;
    if (this.visibility !== undefined) data.visibility = this.visibility;
    if (this.roleIds !== undefined) data.roleIds = this.roleIds;
    return data;
  }
}

export class BoardDetail {
  public id!: string;
  public name?: string;
  public description?: string;
  public background?: string;
  public workspace_id!: string;

  constructor(payload: Partial<BoardDetail>) {
    Object.assign(this, payload);
  }
}
