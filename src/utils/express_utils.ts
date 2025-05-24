import {ResponseData, ResponseListData} from "@/utils/response_utils";
export class ExpressResponse {
	private single_data?: ResponseData<any>;
	private list_data?: ResponseListData<Array<any>>;
}