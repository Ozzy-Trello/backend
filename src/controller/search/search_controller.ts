import { ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import {
  SearchControllerI,
  SearchResult,
  GroupedSearchResults,
} from "./search_interfaces";
import { CardRepositoryI } from "@/repository/card/card_interfaces";
import { BoardRepositoryI } from "@/repository/board/board_interfaces";
import { CardAttachmentRepositoryI } from "@/repository/card_attachment/card_attachment_interface";
import db from "@/database";
import { sql } from "kysely";

export class SearchController implements SearchControllerI {
  private card_repo: CardRepositoryI;
  private board_repo: BoardRepositoryI;
  private card_attachment_repo: CardAttachmentRepositoryI;

  constructor(
    card_repo: CardRepositoryI,
    board_repo: BoardRepositoryI,
    card_attachment_repo: CardAttachmentRepositoryI
  ) {
    this.card_repo = card_repo;
    this.board_repo = board_repo;
    this.card_attachment_repo = card_attachment_repo;
  }

  async UnifiedSearch(
    query: string,
    workspaceId?: string,
    userId?: string,
    paginate?: Paginate
  ): Promise<ResponseListData<GroupedSearchResults>> {
    if (!query || query.trim().length === 0) {
      return new ResponseListData(
        {
          message: "Query parameter is required",
          status_code: StatusCodes.BAD_REQUEST,
          data: { cards: [], boards: [] },
        },
        paginate || new Paginate(1, 10)
      );
    }

    const cardResults: SearchResult[] = [];
    const boardResults: SearchResult[] = [];

    try {
      // Search cards with board_id by joining with list table
      const cardSearchQuery = db
        .selectFrom("card")
        .innerJoin("list", "card.list_id", "list.id")
        .where((eb) => {
          let conditions = eb.and([]);

          // Add search conditions
          const orConditions = [
            eb("card.name", "ilike", `%${query}%`),
            eb("card.description", "ilike", `%${query}%`),
          ];
          conditions = eb.and([conditions, eb.or(orConditions)]);

          // Add archive filter - cards that are not archived
          conditions = eb.and([
            conditions,
            eb.or([
              eb("card.archive", "is", null),
              eb("card.archive", "=", false),
            ]),
          ]);

          return conditions;
        })
        .select([
          "card.id",
          "card.name",
          "card.description",
          "card.list_id",
          "card.created_at",
          "card.updated_at",
          "list.board_id",
        ])
        .limit(50);

      const cardSearchResults = await cardSearchQuery.execute();

      if (cardSearchResults && cardSearchResults.length > 0) {
        // Get card covers
        const cardIds = cardSearchResults.map((card) => card.id);
        const attachmentCovers =
          await this.card_attachment_repo.getCoverAttachmentList(cardIds);
        const attachmentCoversMap = new Map();

        if (
          attachmentCovers.status_code === StatusCodes.OK &&
          attachmentCovers.data
        ) {
          attachmentCovers.data.forEach((attachment) => {
            attachmentCoversMap.set(attachment.card_id, attachment);
          });
        }

        // Convert cards to search results
        for (const card of cardSearchResults) {
          const attachment = attachmentCoversMap.get(card.id);
          const cover = attachment ? (attachment as any)?.file?.url : undefined;

          cardResults.push({
            id: card.id!,
            name: card.name!,
            description: card.description,
            type: "card",
            list_id: card.list_id!,
            board_id: card.board_id!, // Now we have board_id
            cover,
            created_at: card.created_at,
            updated_at: card.updated_at,
          });
        }
      }

      // Search boards
      const boardFilter: any = {
        __orName: query,
        __orDescription: query,
        workspace_id: workspaceId,
      };

      if (userId) {
        boardFilter.userId = userId;
      }

      const boardSearchResults = await this.board_repo.getBoardList(
        boardFilter,
        new Paginate(1, 50) // Get more results to combine with cards
      );

      if (
        boardSearchResults.status_code === StatusCodes.OK &&
        boardSearchResults.data
      ) {
        // Convert boards to search results
        for (const board of boardSearchResults.data) {
          boardResults.push({
            id: board.id!,
            name: board.name!,
            description: board.description,
            type: "board",
            workspace_id: board.workspace_id!,
            created_at: board.created_at,
            updated_at: board.updated_at,
          });
        }
      }

      // Sort each group by relevance (exact name matches first, then by updated date)
      const sortByRelevance = (a: SearchResult, b: SearchResult) => {
        const queryLower = query.toLowerCase();
        const aNameMatch = a.name.toLowerCase().includes(queryLower);
        const bNameMatch = b.name.toLowerCase().includes(queryLower);

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        // If both match or both don't match, sort by updated date
        const aDate = a.updated_at || a.created_at || new Date(0);
        const bDate = b.updated_at || b.created_at || new Date(0);
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      };

      cardResults.sort(sortByRelevance);
      boardResults.sort(sortByRelevance);

      // Create grouped results
      const groupedResults: GroupedSearchResults = {
        cards: cardResults,
        boards: boardResults,
      };

      // Set total count for pagination
      const paginateObj = paginate || new Paginate(1, 10);
      paginateObj.setTotal(cardResults.length + boardResults.length);

      return new ResponseListData(
        {
          message: "Search results",
          status_code: StatusCodes.OK,
          data: groupedResults,
        },
        paginateObj
      );
    } catch (error) {
      console.error("Search error:", error);
      return new ResponseListData(
        {
          message: "Internal server error during search",
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
          data: { cards: [], boards: [] },
        },
        paginate || new Paginate(1, 10)
      );
    }
  }
}
