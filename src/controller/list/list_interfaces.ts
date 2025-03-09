import { validate as isValidUUID } from 'uuid';

import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import { ListDetail, ListDetailUpdate, filterListDetail } from "@/repository/list/list_interfaces";

export interface ListControllerI {
	CreateList(user_id: string, data: ListCreateData): Promise<ResponseData<CreateListResponse>>
	GetList(filter: ListFilter): Promise<ResponseData<ListResponse>>
	GetListList(filter: ListFilter, paginate: Paginate): Promise<ResponseListData<Array<ListResponse>>>
	DeleteList(filter: ListFilter): Promise<ResponseData<null>>
	UpdateList(filter: ListFilter, data: UpdateListData): Promise<ResponseData<null>>
}

export class CreateListResponse {
	id!: string;

	constructor(payload: Partial<CreateListResponse>) {
		Object.assign(this, payload)
	}
}

export class ListResponse {
	id!: string;
	name?: string;
	background?: string;

	constructor(payload: Partial<ListResponse>) {
		Object.assign(this, payload)
	}
}

export function fromListDetailToListResponse(data: ListDetail): ListResponse {
	return new ListResponse({
		id: data.id,
		name: data.name!,
		background: data.background,
	})
}

export function fromListDetailToListResponseList(data: Array<ListDetail>): Array<ListResponse> {
	let result: Array<ListResponse> = [];
	for (const datum of data) {
		result.push(fromListDetailToListResponse(datum))
	}
	return result
}

export class UpdateListData {
	name?: string;
	background?: string;

	constructor(payload: Partial<UpdateListData>) {
		Object.assign(this, payload)
		this.toListDetailUpdate = this.toListDetailUpdate.bind(this)
		this.isEmpty = this.isEmpty.bind(this)
	}

	isEmpty(): boolean{
		return this.name == undefined && this.background == undefined;
	}

	toListDetailUpdate(): ListDetailUpdate {
		return new ListDetailUpdate({
			name: this.name,
			background: this.background,
		})
	}
}

export class ListFilter {
	id ?: string;
	name?: string;
	board_id?: string
	background?: string;

	constructor(payload: Partial<ListFilter>) {
		Object.assign(this, payload);
		this.isEmpty = this.isEmpty.bind(this)
		this.toFilterListDetail = this.toFilterListDetail.bind(this)
		this.getErrorfield = this.getErrorfield.bind(this)
	}

	toFilterListDetail(): filterListDetail{
		return {
			id: this.id,
			name: this.name,
			board_id: this.board_id,
			background: this.background,
		}
	}

	isEmpty(): boolean{
		return this.id == undefined && this.name == undefined && this.board_id == undefined && this.background == undefined;
	}

	getErrorfield(): string| null {
		if ( this.id && !isValidUUID(this.id)) {
			return "'id' is not valid uuid"
		}
		if ( this.board_id && !isValidUUID(this.board_id)) {
			return "'board_id' is not valid uuid"
		}
		return null
	}
}


export class ListCreateData {
	name!: string;
	description?: string;
	background?: string;
	board_id!: string;

	constructor(payload: Partial<ListCreateData>) {
		Object.assign(this, payload)
		this.toListDetail = this.toListDetail.bind(this);
		this.checkRequired = this.checkRequired.bind(this);
		this.getErrorField = this.getErrorField.bind(this);
	}

	toListDetail(): ListDetail {
		return new ListDetail({
			name: this.name,
			background: this.background,
			board_id: this.board_id
		})
	}

	checkRequired(): string | null{
		if (this.board_id == undefined ) return 'board_id'
		return null
	} 

	getErrorField(): string | null {
		if (this.board_id && !isValidUUID(this.board_id!)) {
			return "'board_id' is not valid uuid"
		}
		return null
	}
}