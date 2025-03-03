export class Response {
	public status_code!: number;
	public message!: string

	constructor(payload: Partial<Response>) {
		Object.assign(this, payload);
	}
}

export class ResponseData<Type> extends Response {
	public data?: Type;
	constructor(payload: Partial<ResponseData<Type>>) {
		super(payload);
		Object.assign(this, payload);
	}
}

export class ResponseListData<Type> extends ResponseData<Type> {
	public paginate!: PaginateData
	constructor(payload: Partial<ResponseData<Type>>, paginate: PaginateData) {
		super(payload);
		this.paginate = paginate;
	}
}

export class PaginateData {
	limit!: number;
	page!: number;
	total_page!: number;
	total_data!: number;
	next_page?: number | null;
	prev_page?: number | null;
}
