import { validate as isValidUUID } from 'uuid';

import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import {filterWorkspaceDetail, WorkspaceDetail, WorkspaceDetailUpdate} from "@/repository/workspace/workspace_interfaces";

export interface WorkspaceControllerI {
	CreateWorkspace(user_id: string, data: WorkspaceCreateData): Promise<ResponseData<CreateWorkspaceResponse>>
	GetWorkspace(filter: WorkspaceFilter): Promise<ResponseData<WorkspaceResponse>>
	GetWorkspaceList(filter: WorkspaceFilter, paginate: Paginate): Promise<ResponseListData<Array<WorkspaceResponse>>>
	DeleteWorkspace(filter: WorkspaceFilter): Promise<ResponseData<null>>
	UpdateWorkspace(filter: WorkspaceFilter, data: UpdateWorkspaceData): Promise<ResponseData<null>>
}

export class CreateWorkspaceResponse {
	id!: string;

	constructor(payload: Partial<CreateWorkspaceResponse>) {
		Object.assign(this, payload)
	}
}

export class WorkspaceResponse {
	id!: string;
	name?: string;
	description?: string;
	slug?: string

	constructor(payload: Partial<WorkspaceResponse>) {
		Object.assign(this, payload)
	}
}

export function fromWorkspaceDetailToWorkspaceResponse(data: WorkspaceDetail): WorkspaceResponse {
	return new WorkspaceResponse({
		id: data.id,
		name: data.name!,
		description: data.description,
		slug: data.slug!,
	})
}

export function fromWorkspaceDetailToWorkspaceResponseList(data: Array<WorkspaceDetail>): Array<WorkspaceResponse> {
	let result: Array<WorkspaceResponse> = [];
	for (const datum of data) {
		result.push(fromWorkspaceDetailToWorkspaceResponse(datum))
	}
	return result
}

export class UpdateWorkspaceData {
	name?: string;
	description?: string;
	slug?: string;

	constructor(payload: Partial<UpdateWorkspaceData>) {
		Object.assign(this, payload)
		this.toWorkspaceDetailUpdate = this.toWorkspaceDetailUpdate.bind(this)
		this.isEmpty = this.isEmpty.bind(this)
	}

	isEmpty(): boolean{
		return this.name == undefined && this.description == undefined;
	}

	toWorkspaceDetailUpdate(): WorkspaceDetailUpdate {
		return new WorkspaceDetailUpdate({
			name: this.name,
			description: this.description,
			slug: this.slug,
		})
	}
}

export class WorkspaceFilter {
	id ?: string;
	name?: string;
	slug?: string;
	description?: string;
	user_id_owner?: string;

	constructor(payload: Partial<WorkspaceFilter>) {
		Object.assign(this, payload);
		this.isEmpty = this.isEmpty.bind(this)
		this.getErrorField = this.getErrorField.bind(this)
		this.toFilterWorkspaceDetail = this.toFilterWorkspaceDetail.bind(this)
	}

	toFilterWorkspaceDetail(): filterWorkspaceDetail{
		return new filterWorkspaceDetail({
			id: this.id,
			name: this.name,
			slug: this.slug,
			description: this.description,
			user_id_owner: this.user_id_owner,
		})
	}

	getErrorField(): string | null {
		if(this.id && !isValidUUID(this.id)) {
			return "id is not vaild uuid"
		}
		return null
	}

	isEmpty(): boolean{
		return this.id == undefined && this.name == undefined && this.slug == undefined && this.description == undefined && this.user_id_owner == undefined;
	}
}


export class WorkspaceCreateData {
	name!: string;
	description?: string;
	slug?: string;

	constructor(payload: Partial<WorkspaceCreateData>) {
		Object.assign(this, payload)
		this.toWorkspaceDetail = this.toWorkspaceDetail.bind(this);
		this.isEmpty = this.isEmpty.bind(this);
	}

	toWorkspaceDetail(): WorkspaceDetail {
		return new WorkspaceDetail({
			name: this.name,
			description: this.description,
			slug: this.slug
		})
	}

	isEmpty(): boolean{
		return this.name == undefined && this.slug == undefined && this.description == undefined;
	}
}