import { validate as isValidUUID } from 'uuid';

import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import { CardDetail, CardDetailUpdate, filterCardDetail } from "@/repository/card/card_interfaces";

export interface CardControllerI {
	CreateCard(user_id: string, data: CardCreateData): Promise<ResponseData<CreateCardResponse>>
	GetCard(filter: CardFilter): Promise<ResponseData<CardResponse>>
	GetListCard(filter: CardFilter, paginate: Paginate): Promise<ResponseListData<Array<CardResponse>>>
	DeleteCard(filter: CardFilter): Promise<ResponseData<null>>
	UpdateCard(filter: CardFilter, data: UpdateCardData): Promise<ResponseData<null>>
}

export class CreateCardResponse {
	id!: string;

	constructor(payload: Partial<CreateCardResponse>) {
		Object.assign(this, payload)
	}
}

export class CardResponse {
	id!: string;
	name?: string;
	description?: string;

	constructor(payload: Partial<CardResponse>) {
		Object.assign(this, payload)
	}
}

export function fromCardDetailToCardResponse(data: CardDetail): CardResponse {
	return new CardResponse({
		id: data.id,
		name: data.name!,
		description: data.description,
	})
}

export function fromCardDetailToCardResponseCard(data: Array<CardDetail>): Array<CardResponse> {
	let result: Array<CardResponse> = [];
	for (const datum of data) {
		result.push(fromCardDetailToCardResponse(datum))
	}
	return result
}

export class UpdateCardData {
	name?: string;
	description?: string;
	list_id?: string;

	constructor(payload: Partial<UpdateCardData>) {
		Object.assign(this, payload)
		this.toCardDetailUpdate = this.toCardDetailUpdate.bind(this)
		this.isEmpty = this.isEmpty.bind(this)
		this.getErrorfield = this.getErrorfield.bind(this)
	}

	isEmpty(): boolean{
		return this.name == undefined && this.description == undefined;
	}

	toCardDetailUpdate(): CardDetailUpdate {
		return new CardDetailUpdate({
			name: this.name,
			description: this.description,
		})
	}
	getErrorfield(): string| null {
		if ( this.list_id && !isValidUUID(this.list_id)) {
			return "'list_id' is not valid uuid"
		}
		return null
	}
}

export class CardFilter {
	id ?: string;
	name?: string;
	list_id?: string
	description?: string;

	constructor(payload: Partial<CardFilter>) {
		Object.assign(this, payload);
		this.isEmpty = this.isEmpty.bind(this)
		this.toFilterCardDetail = this.toFilterCardDetail.bind(this)
		this.getErrorfield = this.getErrorfield.bind(this)
	}

	toFilterCardDetail(): filterCardDetail{
		return {
			id: this.id,
			name: this.name,
			list_id: this.list_id,
			description: this.description,
		}
	}

	isEmpty(): boolean{
		return this.id == undefined && this.name == undefined && this.list_id == undefined && this.description == undefined;
	}

	getErrorfield(): string| null {
		if ( this.id && !isValidUUID(this.id)) {
			return "'id' is not valid uuid"
		}
		if ( this.list_id && !isValidUUID(this.list_id)) {
			return "'list_id' is not valid uuid"
		}
		return null
	}
}


export class CardCreateData {
	name!: string;
	description?: string;
	list_id!: string;

	constructor(payload: Partial<CardCreateData>) {
		Object.assign(this, payload)
		this.toCardDetail = this.toCardDetail.bind(this);
		this.checkRequired = this.checkRequired.bind(this);
		this.getErrorField = this.getErrorField.bind(this);
	}

	toCardDetail(): CardDetail {
		return new CardDetail({
			name: this.name,
			description: this.description,
			list_id: this.list_id
		})
	}

	checkRequired(): string | null{
		if (this.list_id == undefined ) return 'list_id'
		return null
	} 

	getErrorField(): string | null {
		if (this.list_id && !isValidUUID(this.list_id!)) {
			return "'list_id' is not valid uuid"
		}
		return null
	}
}