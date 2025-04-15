import { FindOptions, Model } from "sequelize";
import { PaginateData } from "@/utils/response_utils";

export class Paginate extends PaginateData{
	constructor(page: number, limit: number) {
		super();
		this.limit = limit > 1000 ? 1000 : limit <= 0 || !limit ? 10 : limit;
		this.page = page > 0 ? page : 1;

		this.getOffset = this.getOffset.bind(this)
		this.setTotal = this.setTotal.bind(this)
	}

	getOffset(): number {
		return (this.page - 1) * this.limit;
	}

	setTotal(total_data: number) {
		this.total_data = total_data;
		this.total_page = Math.ceil(this.total_data / this.limit);
		this.next_page = this.total_page > this.page ? this.page + 1 : null;
		this.prev_page = this.page > 1 ? this.page - 1 : null;
	}

	getPaginationOptions<T extends Model>(): FindOptions<T> {
		return {
			offset: this.getOffset(),
			limit: this.limit,
		};
	}
}

export function isFilterEmpty(obj: any): boolean {
	return !((Object.getOwnPropertySymbols(obj).length == 0) || (Object.keys(obj).length == 0))
}
