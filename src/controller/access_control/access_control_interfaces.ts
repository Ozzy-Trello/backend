import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import {RoleDetail, RoleDetailUpdate, filterRoleDetail} from "@/repository/role_access/role_interfaces";
import { isPermissionStructure, PermissionStructure } from "@/utils/security_utils";

export interface AccessControlControllerI {
	CreateAccessControl(user_id: string, data: AccessControlCreateData): Promise<ResponseData<CreateAccessControlResponse>>
	GetAccessControl(filter: AccessControlFilter): Promise<ResponseData<AccessControlResponse>>
	GetAccessControlList(filter: AccessControlFilter, paginate: Paginate): Promise<ResponseListData<Array<AccessControlResponse>>>
	DeleteAccessControl(filter: AccessControlFilter): Promise<ResponseData<null>>
	UpdateAccessControl(filter: AccessControlFilter, data: UpdateAccessControlData): Promise<ResponseData<null>>
}

export class CreateAccessControlResponse {
	id!: string;

	constructor(payload: Partial<CreateAccessControlResponse>) {
		Object.assign(this, payload)
	}
}

export class AccessControlResponse {
	id!: string;
	name?: string;
	description?: string;
	permissions?: PermissionStructure

	constructor(payload: Partial<AccessControlResponse>) {
		Object.assign(this, payload)
	}
}

export function fromRoleDetailToAccessControlResponse(data: RoleDetail): AccessControlResponse {
	return new AccessControlResponse({
		id: data.id,
		name: data.name!,
		description: data.description,
		permissions: data.permissions,
	})
}

export function fromRoleDetailToAccessControlResponseList(data: Array<RoleDetail>): Array<AccessControlResponse> {
	let result: Array<AccessControlResponse> = [];
	for (const datum of data) {
		result.push(fromRoleDetailToAccessControlResponse(datum))
	}
	return result
}

export class UpdateAccessControlData {
	name?: string;
	description?: string;
	permissions?: PermissionStructure

	constructor(payload: Partial<UpdateAccessControlData>) {
		Object.assign(this, payload)
		this.toRoleDetailUpdate = this.toRoleDetailUpdate.bind(this)
		this.isEmpty = this.isEmpty.bind(this)
		this.getErrorField = this.getErrorField.bind(this)
	}

	isEmpty(): boolean{
		return this.name == undefined && this.description == undefined && this.permissions == undefined;
	}

	toRoleDetailUpdate(): RoleDetailUpdate {
		return new RoleDetailUpdate({
			name: this.name,
			description: this.description,
			permissions: this.permissions,
		})
	}

	getErrorField(): string | null {
		if (this.permissions) {
			if (!isPermissionStructure(this.permissions)){
				return "permission is not valid format"
			}
		}
		return null
	}
}

export class AccessControlFilter {
	id ?: string;
	name?: string;
	description?: string;
	permissions?: PermissionStructure;

	constructor(payload: Partial<AccessControlFilter>) {
		Object.assign(this, payload);
		this.isEmpty = this.isEmpty.bind(this)
		this.toFilterRoleDetail = this.toFilterRoleDetail.bind(this)
	}

	toFilterRoleDetail(): filterRoleDetail{
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			permissions: this.permissions
		}
	}

	isEmpty(): boolean{
		return this.id == undefined && this.name == undefined && this.description == undefined;
	}
}


export class AccessControlCreateData {
	name!: string;
	description?: string;
	permissions?: PermissionStructure;

	constructor(payload: Partial<AccessControlCreateData>) {
		Object.assign(this, payload)
		this.toRoleDetail = this.toRoleDetail.bind(this);
		this.isEmpty = this.isEmpty.bind(this);
		this.getErrorField = this.getErrorField.bind(this);
	}

	toRoleDetail(): RoleDetail {
		return new RoleDetail({
			name: this.name,
			description: this.description,
			permissions: this.permissions,
		})
	}

	isEmpty(): boolean{
		return this.name == undefined && this.description == undefined && this.permissions == undefined;
	}

	getErrorField(): string | null {
		if (this.permissions) {
			if (!isPermissionStructure(this.permissions)){
				return "permission is not valid format"
			}
		}
		return null
	}
}