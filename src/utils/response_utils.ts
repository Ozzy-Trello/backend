export class Response {
	public status_code!: number;
	public message!: string

	constructor(payload: Partial<Response>) {
		Object.assign(this, payload);
	}
}

export class ResponseData<Type> extends Response {
	public data?: Type;
	constructor(payload: Partial<ResponseData<any>>) {
		super(payload);
		Object.assign(this, payload);
	}
}

export class ResponseListData extends ResponseData<any> {
	constructor(payload: Partial<ResponseListData>) {
		super(payload);
		Object.assign(this, payload);
	}
	public paginate!: PaginateData
}

export class PaginateData {
	limit!: number;
	page!: number;
	total_page!: number;
	total_data!: number;
	next_page?: number | null;
	prev_page?: number | null;
}
