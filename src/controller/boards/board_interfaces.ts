import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import { BoardDetail, BoardDetailUpdate, filterBoardDetail } from "@/repository/board/board_interfaces";

export interface BoardControllerI {
	CreateBoard(user_id: string, data: BoardCreateData): Promise<ResponseData<CreateBoardResponse>>
	GetBoard(filter: BoardFilter): Promise<ResponseData<BoardResponse>>
	GetBoardList(filter: BoardFilter, paginate: Paginate): Promise<ResponseListData<Array<BoardResponse>>>
	DeleteBoard(filter: BoardFilter): Promise<ResponseData<null>>
	UpdateBoard(filter: BoardFilter, data: UpdateBoardData): Promise<ResponseData<null>>
}

export class CreateBoardResponse {
	id!: string;

	constructor(payload: Partial<CreateBoardResponse>) {
		Object.assign(this, payload)
	}
}

export class BoardResponse {
	id!: string;
	name?: string;
	description?: string;
	background?: string;

	constructor(payload: Partial<BoardResponse>) {
		Object.assign(this, payload)
	}
}

export function fromBoardDetailToBoardResponse(data: BoardDetail): BoardResponse {
	return new BoardResponse({
		id: data.id,
		name: data.name!,
		description: data.description,
		background: data.background,
	})
}

export function fromBoardDetailToBoardResponseList(data: Array<BoardDetail>): Array<BoardResponse> {
	let result: Array<BoardResponse> = [];
	for (const datum of data) {
		result.push(fromBoardDetailToBoardResponse(datum))
	}
	return result
}

export class UpdateBoardData {
	name?: string;
	description?: string;
	background?: string;

	constructor(payload: Partial<UpdateBoardData>) {
		Object.assign(this, payload)
		this.toBoardDetailUpdate = this.toBoardDetailUpdate.bind(this)
		this.isEmpty = this.isEmpty.bind(this)
	}

	isEmpty(): boolean{
		return this.name == undefined && this.description == undefined && this.background == undefined;
	}

	toBoardDetailUpdate(): BoardDetailUpdate {
		return new BoardDetailUpdate({
			name: this.name,
			description: this.description,
			background: this.background,
		})
	}
}

export class BoardFilter {
	id ?: string;
	name?: string;
	description?: string;
	workspace_id?: string;
	workspace_user_id_owner?: string;
	background?: string;

	constructor(payload: Partial<BoardFilter>) {
		Object.assign(this, payload);
		this.isEmpty = this.isEmpty.bind(this)
		this.toFilterBoardDetail = this.toFilterBoardDetail.bind(this)
	}

	toFilterBoardDetail(): filterBoardDetail{
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			workspace_id: this.workspace_id,
			background: this.background,
			
		}
	}

	isEmpty(): boolean{
		return this.id == undefined && this.name == undefined && this.description == undefined && this.background == undefined;
	}
}


export class BoardCreateData {
	name!: string;
	description?: string;
	background?: string;
	workspace_id!: string;

	constructor(payload: Partial<BoardCreateData>) {
		Object.assign(this, payload)
		this.toBoardDetail = this.toBoardDetail.bind(this);
		this.checkRequired = this.checkRequired.bind(this);
	}

	toBoardDetail(): BoardDetail {
		return new BoardDetail({
			name: this.name,
			description: this.description,
			background: this.background,
			workspace_id: this.workspace_id
		})
	}

	checkRequired(): string | null{
		if (this.workspace_id == undefined ) return 'workspace_id'
		return null
	} 
}