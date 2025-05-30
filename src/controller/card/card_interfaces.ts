import { validate as isValidUUID } from 'uuid';

import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import { CardDetail, CardDetailUpdate, filterCardDetail } from "@/repository/card/card_interfaces";
import { AssignCardDetail } from '@/repository/custom_field/custom_field_interfaces';
import { CardActionValue, CardActivityType, ConditionType, SourceType, TriggerTypes } from '@/types/custom_field';
import { AutomationCondition } from '@/types/trigger';
import { CardListTimeDetail } from '@/repository/card_list_time/card_list_time_interface';
import { CardBoardTimeDetail } from '@/repository/card_board_time/card_board_time_interface';
import { CardType } from '@/types/card';

export interface CardControllerI {
	CreateCard(user_id: string, data: CardCreateData): Promise<ResponseData<CreateCardResponse>>
	GetCard(filter: CardFilter): Promise<ResponseData<CardResponse>>
	GetListCard(filter: CardFilter, paginate: Paginate): Promise<ResponseListData<Array<CardResponse>>>
	SearchCard(filter: CardSearch, paginate: Paginate): Promise<ResponseListData<Array<CardResponse>>>
	DeleteCard(filter: CardFilter): Promise<ResponseData<null>>
	MoveCard(user_id: string, filter: CardMoveData): Promise<ResponseData<CardResponse>>
	ArchiveCard(user_id: string, card_id: string): Promise<ResponseData<null>>
	UnArchiveCard(user_id: string, card_id: string): Promise<ResponseData<null>>
	AddCustomField(card_id: string, custom_field_id: string, value: string | number): Promise<ResponseData<null>>
	RemoveCustomField(card_id: string, custom_field_id: string): Promise<ResponseData<null>>
	UpdateCustomField(card_id: string, custom_field_id: string, value: string | number): Promise<ResponseData<null>>
	GetListCustomField(card_id: string, paginate: Paginate): Promise<ResponseListData<Array<AssignCardResponse>>>
	UpdateCard(user_id: string, filter: CardFilter, data: UpdateCardData): Promise<ResponseData<null>>
	GetCardActivity(card_id: string, paginate: Paginate): Promise<ResponseListData<Array<CardResponse>>>
	GetCardTimeInList(card_id: string): Promise<ResponseData<Array<CardListTimeDetail>>>
	GetCardTimeInBoard(card_id: string, board_id: string): Promise<ResponseData<CardBoardTimeDetail>>
	GetDashcardCount(dashcardId: string): Promise<ResponseData<number>>
	CompleteCard(user_id: string, card_id: string): Promise<ResponseData<null>> // Added
	IncompleteCard(user_id: string, card_id: string): Promise<ResponseData<null>> // Added
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
	location?: string;
	order?: number;
	list_id?: string;
	type?: string;
	cover?: string;
	created_at?: Date;
	updated_at?: Date;
	dash_config?: DashCardConfig;
	formatted_time_in_list?: string;
	formatted_time_in_board?: string;
	is_complete?: boolean; // Added
	completed_at?: Date;   // Added
	constructor(payload: Partial<CardResponse>) {
		Object.assign(this, payload)
	}
}

export class AssignCardResponse {
	id!: string;
	name!: string;
	description?: string;
	value?: null | string | number;
	order!: number;
	source!: SourceType;
	location?: string;

	constructor(payload: Partial<AssignCardResponse>) {
		Object.assign(this, payload)
	}
}

export function fromCardDetailToCardResponse(data: CardDetail): CardResponse {
	return new CardResponse({
		id: data.id,
		name: data.name!,
		type: data.type,
		description: data.description,
		location: data?.location,
		order: data.order,
		list_id: data.list_id,
		dash_config: data.dash_config,
		cover: data.cover,
		created_at: data.created_at,
		updated_at: data.updated_at,
		formatted_time_in_list: data.formatted_time_in_list,
		formatted_time_in_board: data.formatted_time_in_board
	})
}

export function fromCardDetailToCardResponseCard(data: Array<CardDetail>): Array<CardResponse> {
	let result: Array<CardResponse> = [];
	for (const datum of data) {
		result.push(fromCardDetailToCardResponse(datum))
	}
	return result
}

export function fromCustomFieldDetailToCustomFieldResponseCard(data: Array<AssignCardDetail>): Array<AssignCardResponse> {
	let result: Array<AssignCardResponse> = [];
	for (const datum of data) {
		result.push(new AssignCardResponse({
			id: datum.id,
			name: datum.name,
			order: datum.order,
			source:  datum.source,
			value: datum.value,
		}))
	}
	return result
}

export class UpdateCardData {
	name?: string;
	description?: string;
	list_id?: string;
	location?: string;
	is_complete?: boolean; // Added
	completed_at?: Date;   // Added

	constructor(payload: Partial<UpdateCardData>) {
		Object.assign(this, payload)
		this.toCardDetailUpdate = this.toCardDetailUpdate.bind(this)
		this.isEmpty = this.isEmpty.bind(this)
		this.getErrorfield = this.getErrorfield.bind(this)
	}

	isEmpty(): boolean{
		return this.name == undefined && this.description == undefined && this.list_id == undefined && this.location == undefined;
	}

	toCardDetailUpdate(): CardDetailUpdate {
		return new CardDetailUpdate({
			name: this.name,
			description: this.description,
			list_id: this.list_id,
			location: this.location
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
	board_id?: string;
	list_id?: string
	description?: string;
	location?: string;
	archive?: boolean;
	is_complete?: boolean; // Added
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
			board_id: this.board_id,
			list_id: this.list_id,
			description: this.description,
			location: this.location,
			archive: this.archive,
			is_complete: this.is_complete // Added
		}
	}

	isEmpty(): boolean{
		return this.id == undefined && this.name == undefined && this.list_id == undefined && this.description == undefined && this.location == undefined && this.archive == undefined;
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

export class CardSearch {
	name?: string;
	description?: string;

	constructor(payload: {
    name?: string;
    description?: string;
  }) {
    this.name = payload.name;
    this.description = payload.description;
  }

	toFilterCardDetail(): filterCardDetail{
		return {
			__orName: this.name,
			__orDescription: this.description,
		}
	}

	isEmpty(): boolean {
    return !this.name && !this.description;
  }
}


export class CardMoveData {
	id!: string;
	previous_list_id!: string;
	target_list_id!: string;
	previous_position?: number;
	target_position?: number;
	constructor(payload: Partial<CardMoveData>) {
		Object.assign(this, payload)
		this.getErrorField = this.getErrorField.bind(this);
	}
	getErrorField(): string | null {
		if (this.id && !isValidUUID(this.id)) {
			return "'id' is not valid uuid"
		}
		if (this.previous_list_id && !isValidUUID(this.previous_list_id)) {
			return "'previous_list_id' is not valid uuid"
		}
		if (this.target_list_id && !isValidUUID(this.target_list_id)) {
			return "'target_list_id' is not valid uuid"
		}
		return null
	}
}


export class CardCreateData {
  name!: string;
  description?: string;
  list_id!: string;
  order?: number;
  type?: string;
  dash_config?: DashCardConfig | string;
  is_complete?: boolean; // Added
  completed_at?: Date;   // Added
  
  constructor(payload: Partial<CardCreateData>) {
    Object.assign(this, payload);
    
    // Convert dash_config from string to DashCardConfig if needed
    if (typeof this.dash_config === 'string') {
      try {
        this.dash_config = DashCardConfig.fromJSON(this.dash_config);
      } catch (e) {
        console.error("Invalid dash_config JSON:", e);
        // You might want to handle this error differently
      }
    } else if (this.dash_config && !(this.dash_config instanceof DashCardConfig)) {
      // If it's an object but not a DashCardConfig instance
      this.dash_config = new DashCardConfig(this.dash_config as any);
    }
    
    this.toCardDetail = this.toCardDetail.bind(this);
    this.checkRequired = this.checkRequired.bind(this);
    this.getErrorField = this.getErrorField.bind(this);
  }
  
  toCardDetail(): CardDetail {
    // Convert DashCardConfig to JSON string if it exists
    let dashConfigJSON: string | undefined;
    if (this.dash_config) {
      if (this.dash_config instanceof DashCardConfig) {
        dashConfigJSON = this.dash_config.toJSON();
      } else if (typeof this.dash_config === 'string') {
        dashConfigJSON = this.dash_config;
      }
    }
    
    return new CardDetail({
      name: this.name,
      description: this.description,
      list_id: this.list_id,
      order: this.order,
      type: this.type,
      dash_config: dashConfigJSON ? JSON.parse(dashConfigJSON) : undefined,
    });
  }
  
  checkRequired(): string | null {
    if (this.list_id == undefined) return 'list_id';
    if (this.name == undefined) return 'name';
    if (this.type == undefined) return 'type';
    
    // Check if dashcard type requires dash_config
    if (this.type === CardType.Dashcard && !this.dash_config) {
      return 'dash_config';
    }
    
    return null;
  }
  
  getErrorField(): string | null {
    if (this.list_id && !isValidUUID(this.list_id!)) {
      return "'list_id' is not valid uuid";
    }

		if (this.type && (this.type != CardType.Regular && this.type != CardType.Dashcard)) {
			return "Invalid card type";
		}
    
    if (this.type === CardType.Dashcard && this.dash_config) {
      let dashConfig: DashCardConfig;
      
      if (typeof this.dash_config === 'string') {
        try {
          dashConfig = DashCardConfig.fromJSON(this.dash_config);
        } catch (e) {
          return "Invalid dash_config JSON format";
        }
      } else {
        dashConfig = this.dash_config as DashCardConfig;
      }
      
      const dashConfigError = dashConfig.validate();
      if (dashConfigError) return dashConfigError;
    } else if (this.type != CardType.Regular) {
			return "Invalid card type";
		}
    
    return null;
  }
}

export class CardActivity {
  sender_id!: string;
  card_id!: string;
  activity_type!: CardActivityType;

  constructor(payload: Partial<CardActivity>) {
    Object.assign(this, payload);
  }
}

export class CardCommentData extends CardActivity {
  activity_id!: string;
  text!: string;

  constructor(payload: Partial<CardCommentData>){
    super(payload);
    Object.assign(this, payload);
  }

	// toCardComment(): CardComment{
	// 	return new CardComment({
	// 		activity_id: this.activity_id,
	// 		activity_type: this.activity_type,
	// 		card_id: this.card_id,
	// 		sender_id: this.sender_id,
	// 		text: this.text
	// 	})
	// }
}

export class CardActionActivityData extends CardActivity {
  activity_id!: string;
  // action_type!: CardActionType;
  source?: CardActionValue

  constructor(payload: Partial<CardActionActivityData>){
    super(payload);
    Object.assign(this, payload);
  }

	// toCardActionActivity(): CardActionActivity{
	// 	return {
	// 		activity_id: this.activity_id,
	// 		activity_type: this.activity_type,
	// 		card_id: this.card_id,
	// 		sender_id: this.sender_id,
	// 		source: this.source,
	// 		action_type: this.action_type
	// 	}
	// }
}

export class TriggerDoData {
  group_type!: TriggerTypes;
  type!: ConditionType;
  workspace_id!: string;
  condition!: AutomationCondition;
  filter?: any;
	data?: {
		card_id?: string;
		list_id?: string;
	}

  constructor(payload: Partial<TriggerDoData>) {
    Object.assign(this, payload);
  }
}

export interface FilterConfig {
  id?: string;
  label: string;
  type: string;
  operator?: string;
  value?: any;
}

export class DashCardConfig {
  background_color: string;
  filters: FilterConfig[];

  constructor(data: {
    background_color: string;
    filters: FilterConfig[];
  }) {
    this.background_color = data.background_color;
    this.filters = data.filters;
  }

  validate(): string | null {
    if (!Array.isArray(this.filters)) return "Filters must be an array";
    return null;
  }
	toJSON(): string {
    return JSON.stringify({
      background_color: this.background_color,
      filters: this.filters
    });
	}
	static fromJSON(jsonStr: string): DashCardConfig {
    try {
      const data = JSON.parse(jsonStr);
      return new DashCardConfig({
        background_color: data.background_color,
        filters: data.filters
      });
    } catch (e) {
      throw new Error("Invalid DashCardConfig JSON");
    }
  }
}