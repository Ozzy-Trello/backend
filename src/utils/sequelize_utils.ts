import { FindOptions, Model } from "sequelize";
import { PaginateData } from "@/utils/response_utils";

class Paginate extends PaginateData{
	constructor(limit: number, page: number, total_data: number) {
		super();
		this.limit = limit > 1000 ? 1000 : limit <= 0 ? 10 : limit;
		this.page = page > 0 ? page : 1;
		this.total_data = total_data;
		this.total_page = Math.ceil(this.total_data / this.limit);
		this.next_page = this.total_page > this.page ? this.page + 1 : null;
		this.prev_page = this.page > 1 ? this.page - 1 : null;
	}

	getOffset(): number {
		return (this.page - 1) * this.limit;
	}

	getPaginationOptions<T extends Model>(): FindOptions<T> {
		return {
			offset: this.getOffset(),
			limit: this.limit,
		};
	}
}