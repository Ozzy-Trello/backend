import { ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";

export interface SearchControllerI {
  UnifiedSearch(
    query: string,
    workspaceId?: string,
    userId?: string,
    paginate?: Paginate
  ): Promise<ResponseListData<GroupedSearchResults>>;
}

export interface GroupedSearchResults {
  cards: SearchResult[];
  boards: SearchResult[];
}

export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  type: "card" | "board";
  board_id?: string;
  board_name?: string;
  list_id?: string;
  list_name?: string;
  workspace_id?: string;
  workspace_name?: string;
  cover?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class SearchFilter {
  query: string;
  workspace_id?: string;
  user_id?: string;

  constructor(payload: {
    query: string;
    workspace_id?: string;
    user_id?: string;
  }) {
    this.query = payload.query;
    this.workspace_id = payload.workspace_id;
    this.user_id = payload.user_id;
  }

  isEmpty(): boolean {
    return !this.query || this.query.trim().length === 0;
  }
}
